{
  description = "A Nix-flake-based Node.js development environment";

  inputs = {
    # nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1.*.tar.gz";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-23.11";

    alejandra = {
      url = "github:kamadorueda/alejandra/3.0.0";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    fh.url = "https://flakehub.com/f/DeterminateSystems/fh/*.tar.gz";

    nil.url = "github:oxalica/nil";
  };

  outputs = {
    fh,
    nil,
    nixpkgs,
    self,
    ...
  } @ inputs: let
    overlays = [
      (final: prev: {
        nodejs = prev.nodejs_20;
        pnpm = prev.nodePackages.pnpm;
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
        packages = with pkgs; [nodejs pnpm];
        shellHook = ''
          echo "welcome to undici dev shell"
        '';
        # environment variables
        # DEBUG = "Eleventy:UserConfig";
        DEBUG = "eleventy-plugin-text-to-speech*";
      };
    });
  };
}
