import { ListView, StackLayout, Text } from "@nwrks/uikit";
import { useState } from "react";

export function GithubRepoFinder() {
  const [data, setData] = useState([]); // TODO Repair GithubRepoFinder fetch

  return (
    <ListView>
      {[...data.entries()].map((repo, index) => (
        <StackLayout key={index} onClick={() => console.log(repo[1].id)} direction={"Vertical"}>
          <Text size={13} color={"#0f93e1"}>
            {repo[1].full_name}
          </Text>
          <StackLayout spacing={10}>
            <Text style={textEllipsisStyle} size={10}>
              {repo[1].description ? repo[1].description : "No description yet."}
            </Text>
            <Text size={10} style={textEllipsisStyle} disabled>
              {repo[1].visibility}
            </Text>
          </StackLayout>
        </StackLayout>
      ))}
    </ListView>
  );
}
