{
  description = "A Nix-flake-based Node.js development environment";

  inputs = {
    # https://github.com/NixOS/nixpkgs/branches
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable-small";
  };

  outputs = {
    nixpkgs,
    self,
    ...
  } @ inputs: let
    overlays = [
      (final: prev: {
        nodejs = prev.nodejs_21;
      })
    ];
    supportedSystems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];
    forEachSupportedSystem = f:
      nixpkgs.lib.genAttrs supportedSystems (system:
        f {
          pkgs = import nixpkgs {inherit overlays system;};
        });
  in {
    devShells = forEachSupportedSystem ({pkgs}: {
      default = pkgs.mkShell {
        packages = with pkgs; [
          # Cowsay reborn, just for fun
          # https://github.com/Code-Hex/Neo-cowsay
          neo-cowsay
          nodejs
        ];

        shellHook = ''
          cowthink "Welcome to this nix dev shell!" --bold -f tux --rainbow
          echo "Versions:"
          echo "- Node.js $(node --version)"
          echo "- npm $(npm --version)"

          # secrets exposed as environment variables
          export CLOUDFLARE_R2=$(cat /run/secrets/cloudflare/r2 | jq .personal | tr -d '"');
          export ELEVENLABS_API_KEY=$(cat /run/secrets/elevenlabs/api_key);
          export GITHUB_TOKEN=$(cat /run/secrets/github-tokens/semantic_release_bot);
          export NPM_TOKEN=$(cat /run/secrets/npm-tokens/semantic_release_bot);
          export PLAUSIBLE=$(cat /run/secrets/plausible/test_site);
          export TELEGRAM=$(cat /run/secrets/telegram/personal_bot);
        '';

        CLOUDFLARE_ACCOUNT_ID = "43f9884041661b778e95a26992850715";
        # DEBUG = "script:*,Eleventy:EleventyErrorHandler,11ty-plugin:csp:*";
        DEBUG = "Eleventy:EleventyErrorHandler,hosting-utils:*,11ty-plugin:csp:*,csp:*";
        NODE_ENV = "development";
        # SKIP_VALIDATION = 1;
      };
    });
  };
}
