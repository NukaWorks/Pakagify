import { Octokit } from "octokit";
import { v4 as uuidv4 } from "uuid";
import { PackageModel } from "./DataModels/PackageModel";
import { calculateBitrate, listFilesRecursively } from "./Utils";
import AdmZip from "adm-zip";
import { RepoModel } from "./DataModels/RepoModel";
import fs from "fs";
import axios from "axios";
import { EventEmitter } from "events";
import * as path from "path";
import { log } from "console";

export class Pakagify extends EventEmitter {
  #ghToken = "";
  #user = null;
  #reposData = new Map();
  #octokit = null;

  constructor(token) {
    super();
    this.#ghToken = token;
    this.#octokit = new Octokit({ auth: token });
  }

  async createRelease(user, repoName) {
    const uuid = uuidv4().split("-")[1]; // Generate & Get the first part of the uuid
    return await this.#octokit.rest.repos
      .createRelease({
        owner: user,
        repo: repoName,
        tag_name: uuid,
      })
      .then(({ data }) => {
        return data;
      });
  }

  async pushRepoData(user, repoName, fileName, fileData) {
    return this.#octokit.rest.repos
      .getLatestRelease({
        owner: user,
        repo: repoName,
      })
      .then(async ({ data }) => {
        const url = `https://uploads.github.com/repos/${user}/${repoName}/releases/${data.id}/assets?name=${fileName}`;
        const fileStream = Buffer.from(fileData);
        const fileSize = Buffer.byteLength(fileStream);

        const axiosOpts = {
          headers: {
            Authorization: "Bearer " + this.#ghToken,
            "Content-Type": "application/octet-stream",
            "Content-Length": fileSize,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const bitrate = calculateBitrate(progressEvent.rate, progressEvent.estimated / 1000);
            this.emit("uploadProgress", percentCompleted, bitrate, progressEvent.estimated, fileName);
          },
          maxRedirects: 0, // avoid buffering the entire stream
        };

        return await axios
          .post(url, fileStream, axiosOpts)
          .then((response) => {
            if (response.status !== 201) throw new Error(response.statusText);
            return response;
          })
          .catch((error) => {
            if (error.response.status === 422) {
              throw new Error("Asset already exists");
            } else {
              throw new Error("Error uploading asset: " + error);
            }
          });
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async downloadRepoData(user, repoName, DEBUG_MODE) {
    return await this.#octokit.rest.repos
      .getLatestRelease({
        owner: user,
        repo: repoName,
      })
      .then(async ({ data }) => {
        for (const asset of data.assets) {
          const filePath = path.resolve(process.cwd(), asset.name);
          if (fs.existsSync(filePath)) {
            continue;
          }
          if (asset.name === "repo.json") {
            continue;
          }

          DEBUG_MODE && console.log("asset", asset);
          const url = asset.browser_download_url;
          const axiosOpts = {
            responseType: "stream",
            headers: {
              Authorization: "Bearer " + this.#ghToken,
            },
            onDownloadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              const bitrate = calculateBitrate(progressEvent.rate, progressEvent.estimated / 1000);
              this.emit("downloadProgress", percentCompleted, bitrate, progressEvent.estimated, asset.name);
            },
          };
          const response = await axios.get(url, axiosOpts);
          const writer = fs.createWriteStream(filePath);

          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
        }

        return data;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async extractRepoData(DEBUG_MODE, keep) {
    const files = fs.readdirSync(process.cwd());
    const filteredFiles = files.filter((file) => file.endsWith(".pkg.zip"));

    for (const file of filteredFiles) {
      const zip = new AdmZip(file);
      let pkgMetadata = zip.getEntry("pak.json").getData().toString("utf8");
      if (pkgMetadata !== null && pkgMetadata.length > 0) {
        pkgMetadata = JSON.parse(pkgMetadata);
      } else {
        console.error("Corrupted pkg manifest (pak.json):", file);
        continue;
      }

      if (DEBUG_MODE) {
        console.log("Extracting:", `${pkgMetadata.name}-${pkgMetadata.platform}_${pkgMetadata.arch}.pkg.zip`);
      }
      zip.extractAllTo(path.resolve(process.cwd(), `${pkgMetadata.name}-${pkgMetadata.platform}_${pkgMetadata.arch}`));
      if (!keep) fs.rmSync(file);
    }
  }

  async deleteAsset(user, repoName, assetName) {
    return this.getLatestRelease(user, repoName).then(async (rel) => {
      for (const asset of rel.assets) {
        if (asset.name === assetName) {
          await this.#octokit.rest.repos
            .deleteReleaseAsset({
              owner: user,
              repo: repoName,
              asset_id: asset.id,
            })
            .then((res) => res)
            .catch((err) => {
              console.error(err);
            });
        }
      }
    });
  }

  async getGitRepositoryData(user, repoName) {
    return this.#octokit.rest.repos
      .get({
        owner: user,
        repo: repoName,
      })
      .then(async ({ data }) => {
        if (data.status === 404) throw new Error(`Repository ${repoName} not found for user ${user}`);
        return data;
      })
      .catch((err) => {
        throw new Error(`Error fetching the repo data (${err.message}): ERR_CODE: ${err.status}`);
      });
  }

  async getPakRepositoryData(user, repoName) {
    const axiosOpts = {
      headers: {
        Authorization: "Bearer " + this.#ghToken,
        Accept: "application/octet-stream",
      },
    };

    return this.getLatestRelease(user, repoName).then(async (rel) => {
      for (const asset of rel.assets) {
        if (asset.name === "repo.json") {
          // Get the asset data
          return await axios
            .get(`https://api.github.com/repos/${user}/${repoName}/releases/assets/${asset.id}`, axiosOpts)
            .then((res) => {
              return res.data;
            })
            .catch((err) => {
              throw new Error(`Error fetching the repo.json file (${err.message}): ERR_CODE: ${err.status}`);
            });
        }
      }
    });
  }

  async getPackageData(user, repoName, packageName) {
    return this.getPakRepositoryData(user, repoName).then((repo) => {
      repo.packages.forEach((pkg) => {
        if (pkg.name === packageName) {
          return pkg;
        } else {
          throw new Error(`Package not found (${packageName})`);
        }
      });
    });
  }

  async makeRepository(user, repoName, isDebug, isLocalRepository) {
    return this.getGitRepositoryData(user, repoName)
      .then((repo) => {
        const repoModel = RepoModel;
        repoModel.name = repo.name;
        repoModel.description = repo.description;
        repoModel.author = repo.owner.login;
        repoModel.url = repo.html_url;
        repoModel.last_updated = new Date().toISOString();
        repoModel.created_at = new Date().toISOString();
        repoModel.license = repo.license;

        isDebug && console.debug(repo);

        if (!isLocalRepository) {
          return this.createRelease(user, repoName, true).then(async (rel) => {
            isDebug && console.debug(rel);

            return await this.pushRepoData(user, repoName, "repo.json", JSON.stringify(RepoModel)).then((push) => {
              isDebug && console.debug(push);

              // Group the data
              push.asset = push.data;
              delete push.data;
              push.release = rel;
              push.repo = repo;

              return push;
            });
          });
        } else {
          const kitchenDir = path.join(process.cwd(), "kitchen");
          if (!fs.existsSync(kitchenDir)) fs.mkdirSync(kitchenDir);
          if (fs.existsSync(path.join(kitchenDir, "repo.json"))) throw new Error("Repository already exists");
          fs.writeFileSync(path.join(kitchenDir, "repo.json"), JSON.stringify(repoModel));

          return { repo: repoModel };
        }
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  }

  async makeEmptyPackage(packageName, arch, platform) {
    const user = await this.getUser();
    const packageModel = PackageModel;
    packageModel.name = packageName;
    packageModel.version = "1.0.0";
    packageModel.dependencies = [];
    packageModel.arch = arch ?? process.arch;
    packageModel.description = "Empty package";
    packageModel.install_location = "/";
    packageModel.platform = platform ?? process.platform;
    packageModel.author = user?.login ?? "Anonymous";
    packageModel.restart_required = false;
    packageModel.scripts.pre_inst = "";
    packageModel.scripts.post_inst = "";
    packageModel.last_updated = new Date().toISOString();
    packageModel.created_at = new Date().toISOString();

    const pkgFolderContents = path.resolve(
      process.cwd(),
      `${packageModel.name}-${packageModel.platform}_${packageModel.arch}`,
      "Contents"
    );
    if (!fs.existsSync(pkgFolderContents)) {
      fs.mkdirSync(pkgFolderContents, { recursive: true });
    }

    const pakFilePath = path.resolve(pkgFolderContents, "..", "pak.json");
    if (!fs.existsSync(pakFilePath)) {
      fs.writeFileSync(pakFilePath, Buffer.from(JSON.stringify(packageModel), { encoding: "utf-8" }));
    } else {
      throw new Error("Package already created");
    }
  }

  async getLocalPackage(packageFolder) {
    const folderPath = path.resolve(process.cwd(), packageFolder);
    if (!fs.existsSync(folderPath)) {
      throw new Error("Package folder not found");
    }

    const pakFilePath = path.resolve(process.cwd(), packageFolder, "pak.json");

    if (!fs.existsSync(pakFilePath)) {
      throw new Error("Package manifest file not found");
    }

    const pakFile = fs.readFileSync(pakFilePath);
    if (!pakFile || pakFile.length <= 0) {
      throw new Error("Invalid pak.json json file");
    }

    return JSON.parse(pakFile);
  }

  async publishPackage(user, repoName, packageFolder) {
    let packageModel = await this.getLocalPackage(packageFolder);
    const pkgFolder = `${packageModel.name}-${packageModel.platform}_${packageModel.arch}`;

    return await this.getLatestRelease(user, repoName).then(async (release) => {
      const _pkName = `${pkgFolder}.pkg.zip`;
      for (const asset of release.assets) {
        if (asset.name === _pkName) throw new Error(`Package already exists (${packageModel.name})`);
      }
      // Fetch the repo data
      return this.getPakRepositoryData(user, repoName).then(async (repoData) => {
        // Checks if the package already exists on the repo, if so, delete it (in case of update)
        repoData.packages.forEach((value, index, array) => {
          if (
            value.name === packageModel.name &&
            value.platform === packageModel.platform &&
            value.arch === packageModel.arch
          ) {
            array.splice(index, 1);
          } // Remove the package from the array
        });

        // Make a copy and patch the repo data
        const repoDataPatch = repoData;
        repoDataPatch.packages.push(packageModel);
        repoDataPatch.last_updated = new Date().toISOString();

        // Upload the asset
        return this.pushRepoData(
          user,
          repoName,
          `${pkgFolder}.pkg.zip`,
          Buffer.from(fs.readFileSync(`${pkgFolder}.pkg.zip`))
        )
          .then(async () => {
            await this.deleteAsset(user, repoName, "repo.json");
            return await await this.pushRepoData(user, repoName, "repo.json", JSON.stringify(repoDataPatch));
          })
          .catch((err) => {
            throw new Error(`Error uploading the package (${packageName}) - ${err.message}`);
          });
      });
    });
  }

  async buildPackage(user, repoName, packageFolder) {
    let packageModel = await this.getLocalPackage(packageFolder);

    return await this.getLatestRelease(user, repoName).then(async (release) => {
      const _pkName = `${packageModel.name}-${packageModel.platform}_${packageModel.arch}.pkg.zip`;
      packageModel.release_url = release.html_url;
      packageModel.download_url = `${release.html_url}/download/${_pkName}`;
      // https://api.github.com/repos/OWNER/REPO/releases/assets/ASSET_ID
      packageModel.download_url = `https://github.com/${user}/${repoName}/releases/download/${release.tag_name}/${_pkName}`;

      const prefix = "/Contents";
      const zip = new AdmZip("", undefined);
      const pkgFolder = `${packageModel.name}-${packageModel.platform}_${packageModel.arch}`;
      const pkgFolderWithPrefix = path.join(pkgFolder, prefix);
      const pkgContentsFiles = fs.readdirSync(pkgFolderWithPrefix);
      packageModel.files = listFilesRecursively(pkgFolderWithPrefix, pkgContentsFiles);
      packageModel.last_updated = new Date().toISOString();

      const pkgRootFiles = fs.readdirSync(path.join(process.cwd(), pkgFolder));
      pkgRootFiles.forEach((dir) => {
        const fullPath = path.join(pkgFolder, dir);
        if (path.basename(fullPath) === "pak.json") {
          return;
        }

        if (fs.lstatSync(fullPath).isDirectory()) {
          zip.addLocalFolder(fullPath, prefix);
        } else {
          zip.addLocalFile(fullPath, prefix);
        }
      });

      const pakFileBuffer = Buffer.from(JSON.stringify(packageModel), "utf8");
      fs.writeFileSync(path.join(pkgFolder, "pak.json"), pakFileBuffer);
      zip.addFile("pak.json", pakFileBuffer, "", null);
      return zip.writeZipPromise(`${pkgFolder}.pkg.zip`, null);
    });
  }

  async deletePackage(user, repoName, packageName) {
    return this.getPakRepositoryData(user, repoName).then(async (repoData) => {
      if (repoData.packages.length === 0) throw new Error("No packages found");

      const _pkg = [];
      const name = packageName.split("-")[0];
      const descriptors = packageName.split("-")[1].split("_");
      const platform = descriptors[0];
      const arch = descriptors[1];

      await repoData.packages.forEach((value, index, array) => {
        if (name === value.name && arch === value.arch && platform === value.platform)
          array.splice(index, 1) && _pkg.push(value);
      });

      if (_pkg.length > 1) throw new Error(`Multiple packages found (${packageName}) ${JSON.stringify(_pkg)}`);
      if (_pkg.length <= 0) {
        throw new Error(`Package not found (${packageName})`);
      } else {
        await this.deleteAsset(user, repoName, `${packageName}.pkg.zip`);
        await this.deleteAsset(user, repoName, "repo.json");
        return this.pushRepoData(user, repoName, "repo.json", JSON.stringify(repoData));
      }
    });
  }

  async deleteRelease(user, repoName) {
    return this.#octokit.rest.repos
      .getLatestRelease({
        owner: user,
        repo: repoName,
      })
      .then(async (rel) => {
        if (rel.status !== 200) throw new Error("Unable to delete the repository");
        return await this.#octokit.rest.repos.deleteRelease({
          owner: user,
          repo: repoName,
          release_id: rel.data.id,
        });
      })
      .catch((err) => {
        throw new Error(
          `Unable to delete the repository, maybe it's not exist? (${err.message}): ERR_CODE: ${err.status}`
        );
      });
  }

  async getLatestRelease(user, repoName) {
    return await this.#octokit.rest.repos
      .getLatestRelease({
        owner: user,
        repo: repoName,
      })
      .then((rel) => {
        if (rel.status !== 200) throw new Error("Release not found");
        return rel.data;
      })
      .catch((err) => {
        throw new Error(
          `Unable to get the latest release, maybe it's not exist? (${err.message}): ERR_CODE: ${err.status}`
        );
      });
  }

  async getUser(refresh) {
    if (!this.#user || refresh) {
      await this.#octokit.rest.users.getAuthenticated().then(({ data }) => {
        this.#user = data;
      });
    }

    return this.#user;
  }

  async getUserRepos() {
    return await this.#octokit.rest.repos.listForAuthenticatedUser();
  }

  async getOrgRepos(org) {
    return await this.#octokit.rest.repos.listForOrg({ org });
  }

  getRepoData() {
    return this.#reposData;
  }

  async getOrgs() {
    return await this.#octokit.rest.orgs.listForAuthenticatedUser();
  }
}
