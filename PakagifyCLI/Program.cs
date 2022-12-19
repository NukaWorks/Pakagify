var packagify = new PakagifyCore.PakagifyCore("FranceRP-Minecraft", "Packages", "default");

var release = await packagify.GetReleasesToJson();

foreach (var asset in release.Assets)
{
    Console.WriteLine("Asset name: {0}, Asset url: {1}", asset.Name, asset.BrowserDownloadUrl);
}