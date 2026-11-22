import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import license from "rollup-plugin-license";

const packagePath = path.resolve(
  __dirname,
  "package.json",
);

const pkg = JSON.parse(
  readFileSync(
    packagePath,
    "utf-8",
  ),
) as {
  dependencies?: Record<
    string,
    string
  >;

  peerDependencies?: Record<
    string,
    string
  >;
};

const INTERNAL_PACKAGES = [
  "@excalidraw/excalidraw",
  "@excalidraw/common",
  "@excalidraw/element",
  "@excalidraw/math",
  "@excalidraw/utils",
  "@excalidraw/fractional-indexing",
] as const;

const internalAliases = [
  {
    find:
      "@excalidraw/excalidraw",

    replacement:
      path.resolve(
        __dirname,
        "src/excalidraw",
      ),
  },

  {
    find:
      "@excalidraw/common",

    replacement:
      path.resolve(
        __dirname,
        "src/common/src",
      ),
  },

  {
    find:
      "@excalidraw/element",

    replacement:
      path.resolve(
        __dirname,
        "src/element/src",
      ),
  },

  {
    find:
      "@excalidraw/math",

    replacement:
      path.resolve(
        __dirname,
        "src/math/src",
      ),
  },

  {
    find:
      "@excalidraw/utils",

    replacement:
      path.resolve(
        __dirname,
        "src/utils/src",
      ),
  },

  {
    find:
      "@excalidraw/fractional-indexing",

    replacement:
      path.resolve(
        __dirname,
        "src/fractional-indexing/src",
      ),
  },
];

const externalDependencies = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",

  ...Object.keys(
    pkg.dependencies ?? {},
  ),

  ...Object.keys(
    pkg.peerDependencies ?? {},
  ),
];

const isInternalPackage = (
  id: string,
): boolean => {
  return INTERNAL_PACKAGES.some(
    (packageName) =>
      id === packageName ||
      id.startsWith(
        `${packageName}/`,
      ),
  );
};

const isExternalDependency = (
  id: string,
): boolean => {
  if (isInternalPackage(id)) {
    return false;
  }

  return externalDependencies.some(
    (dependency) =>
      id === dependency ||
      id.startsWith(
        `${dependency}/`,
      ),
  );
};

const getFontFamily = (
  filename: string,
): string => {
  const prefix = filename
    .replace(
      /\.(woff2?|ttf|otf)$/,
      "",
    )
    .split("-")[0];

  const fontFamilies:
    Record<string, string> = {
      Assistant:
        "Assistant",

      CascadiaCode:
        "Cascadia",

      ComicShanns:
        "ComicShanns",

      Excalifont:
        "Excalifont",

      LiberationSans:
        "Liberation",

      Lilita:
        "Lilita",

      Nunito:
        "Nunito",

      Virgil:
        "Virgil",

      Xiaolai:
        "Xiaolai",
    };

  return (
    fontFamilies[prefix] ??
    prefix
  );
};

export default defineConfig(
  ({ mode }) => {
    const isDevelopment =
      mode === "development";

    const isGit =
      mode === "git";

    const outDir =
      isGit
        ? "dist-git"
        : "dist";

    return {
      root:
        path.resolve(
          __dirname,
        ),

      base: "./",

      resolve: {
        alias:
          internalAliases,

        extensions: [
          ".ts",
          ".tsx",
          ".js",
          ".jsx",
        ],
      },

      define: {
        "process.env.NODE_ENV":
          JSON.stringify(
            isDevelopment
              ? "development"
              : "production",
          ),
      },

      build: {
        outDir,

        target:
          "es2020",

        emptyOutDir:
          true,

        cssCodeSplit:
          false,

        sourcemap:
          isDevelopment,

        minify:
          !isDevelopment &&
          !isGit,

        assetsInlineLimit:
          0,

        modulePreload:
          false,

        rollupOptions: {
          input:
            path.resolve(
              __dirname,
              "src/excalidraw/index.tsx",
            ),

          preserveEntrySignatures:
            "strict",

          external:
            isExternalDependency,

          output: {
            format: "es",

            entryFileNames:
              "index.es.js",

            chunkFileNames:
              "chunks/chunk-[hash].js",

            assetFileNames:
              (assetInfo) => {
                const name =
                  assetInfo.names?.[0] ??
                  assetInfo.name ??
                  "";

                if (
                  name.endsWith(
                    ".css",
                  )
                ) {
                  return "index.css";
                }

                if (
                  name.endsWith(
                    ".woff2",
                  ) ||
                  name.endsWith(
                    ".woff",
                  ) ||
                  name.endsWith(
                    ".ttf",
                  ) ||
                  name.endsWith(
                    ".otf",
                  )
                ) {
                  const family =
                    getFontFamily(
                      name,
                    );

                  return (
                    `fonts/${family}/` +
                    name
                  );
                }

                return (
                  "assets/" +
                  "[name]-[hash]" +
                  "[extname]"
                );
              },
          },

          plugins: [
            license({
              thirdParty: {
                output: {
                  file:
                    path.join(
                      __dirname,
                      outDir,
                      "LICENSE.txt",
                    ),
                },
              },
            }),
          ],
        },
      },

      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: [
              "import",
              "global-builtin",
              "color-functions",
            ],
          },
        },
      },

      plugins: [
        react(),

        dts({
          outDir:
            "dist/types",

          tsconfigPath:
            path.resolve(
              __dirname,
              "tsconfig.json",
            ),

          include: [
            "src/**/*.ts",
            "src/**/*.tsx",
            "src/**/*.d.ts",
          ],

          exclude: [
            "src/**/*.test.ts",
            "src/**/*.test.tsx",
            "src/**/__tests__/**",
            "src/**/__snapshots__/**",
          ],
        }),
      ],
    };
  },
);
