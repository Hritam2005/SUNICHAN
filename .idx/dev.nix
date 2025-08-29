{ pkgs, ... }:
{
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # Or "unstable" or a specific release like "18.09".
  # Use https://search.nixos.org/packages to find packages.
  packages = [ pkgs.zip pkgs.nodejs_20 ];
  # Sets environment variables in the workspace.
  env = { };
  # Defines commands that can be running in your workspace.
  services = { };
  # Defines ports that can be exposed in your workspace.
  ports = { };
  # Defines the entrypoint for your workspace.
  entrypoint = "/nix/store/s0zz9rwhp96s73j50y6ifff13337nxfc-bash-5.2-p15/bin/bash";

  idx = {
    # Search for extensions on the VSCode Marketplace (https://marketplace.visualstudio.com/)
    # or the Open VSX Registry (https://open-vsx.org/).
    extensions = [
      "vscode.git"
      "vscode.github-pr"
    ];

    workspace = {
      # Runs when a workspace is started.
      onStart = { 
        npm-install = "npm install --no-cache --force";
        # check-env = ". ./.env.example && [[ -z \"$VITE_GEMINI_API_KEY\" ]] && echo \"VITE_GEMINI_API_KEY is not set. Please set it in the .env file.\" || echo \"VITE_GEMINI_API_KEY is set.\"";
      };

      # Runs when a workspace is created.
      onCreate = {
        # Use this to install dependencies, download data, or other one-time setup steps.
        # Example: 
        #   - npm-install = "npm install"
      };
    };

    previews = {
      # Enables the web preview feature.
      enable = true;
      # Previews a specific port of a workspace and optionally specifies how to handle it.
      previews = [
        {
          # The port to preview.
          port = 3000;
          # The name to show for the preview.
          name = "Web";
          # How to handle the preview.
          # - "open": Opens the preview in a new tab.
          # - "embed": Embeds the preview in the IDE.
          # - "ignore": Does not show the preview.
          # Default: "open"
          mode = "embed";
        }
      ];
    };
  };
}