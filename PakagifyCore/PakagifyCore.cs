using System.Text.Json.Nodes;
using Octokit;

namespace PakagifyCore;

public class PakagifyCore
{
    public GitHubClient Github = new GitHubClient(new ProductHeaderValue("PakagifyCore"));
    public String RepositoryOwner;
    public String RepositoryName;
    
    public PakagifyCore(String owner, String projectName, String repoName)
    {
        this.RepositoryOwner = owner;
        this.RepositoryName = projectName;
    }
    
    public async Task<Release> GetReleasesToJson()
    {
        return await Github.Repository.Release.GetLatest(RepositoryOwner, RepositoryName);
    }
}