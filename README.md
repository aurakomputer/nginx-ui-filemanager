# File Manager Plugin for Nginx UI

A modern, web-based file manager for [Nginx UI](https://nginxui.com/) — browse, upload, and delete files on your server directly from the Nginx UI dashboard.

## ✨ Features

- 📁 **Browse directories** — navigate your filesystem with an intuitive breadcrumb and table view
- ⬆️ **Upload files** — drag-and-drop or click to upload to the current directory
- 🗑️ **Delete files & folders** — remove entries with a single click
- 🌗 **Theme-aware UI** — follows Nginx UI's light and dark themes using `--ant-*` CSS variables
- 🔒 **Secure by design** — all HTTP requests are authenticated via Nginx UI's plugin secret and proxied through the host

## 📦 Installation

### From the Nginx UI web interface

1. Download the latest `io.github.aurakomputer.filemanager-<version>.tar.gz` from the releases page.
2. Open **System → Plugins** in Nginx UI.
3. Click **Install from file**, select the archive, and approve the requested permissions.
4. Enable the plugin — a **File Manager** entry appears in the sidebar.

### From the command line

```bash
nginx-ui plugin install io.github.aurakomputer.filemanager-0.1.0.tar.gz \
  --enable --approve-permissions
```

> **Note:** Unsigned packages require **Developer Mode** to be enabled under _Preferences → Plugins_. Only install packages you trust — plugins run with the same OS permissions as Nginx UI.

## 🚀 Usage

1. Open **File Manager** from the Nginx UI sidebar.
2. Use the breadcrumb to navigate between directories.
3. Click a folder to open it, or use **Upload** to add files to the current path.
4. Click **Hapus** (Delete) next to an entry to remove it.

## 🛠️ Development

### Prerequisites

- Node.js 18+
- [Nginx UI](https://nginxui.com/) with Developer Mode enabled
- The `nginx-ui` CLI

### Project structure

```
filemanager/
├── plugin.json          # Plugin manifest
├── README.md
├── LICENSE
├── build.sh             # Builds the server executable
├── server/
│   └── main.js          # JSON-RPC + HTTP backend
└── webapp/
    ├── vite.config.ts   # Uses @nginxui/plugin-sdk/vite preset
    └── src/
        └── FileManagerPage.vue
```

### Build the frontend

```bash
cd webapp
npm install
npm run build
```

`vite build` produces `dist/main.js`, `dist/style.css`, and `dist/manifest.webapp.json`. Merge the generated `webapp` block into `plugin.json`.

### Live reload without repacking

Run a static file server at the plugin root and point Nginx UI at it:

```bash
npx serve .
```

Then, in the Nginx UI plugin page, open the tab menu and set **Development Plugin Address** to `http://localhost:5173/plugin.json`. Refresh the page after each rebuild.

### Package and install

```bash
nginx-ui plugin lint ./
nginx-ui plugin pack ./ io.github.aurakomputer.filemanager-0.1.0.tar.gz
nginx-ui plugin install io.github.aurakomputer.filemanager-0.1.0.tar.gz \
  --enable --approve-permissions
```

> Every change to the server process requires a new package. Frontend-only changes can be reloaded from the development address without repacking.

## 🔐 Security

- The backend validates the `Nginx-UI-Plugin-Secret` header on every request and rejects unauthorized calls with `401`.
- The HTTP server listens on a Unix socket inside the plugin data directory with `0600` permissions.
- **Path sanitization is mandatory.** All file operations must resolve paths against an allowed root and reject traversal attempts (`../`).
- Plugins run with the same OS privileges as Nginx UI — review the source before installing.

## 🧩 How it works

| Layer            | Responsibility                                                                                                                                                           |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/main.js` | Handles the JSON-RPC handshake (`plugin.initialize`, `plugin.ping`, `plugin.shutdown`), starts an HTTP server on `http.sock`, and exposes `/list`, `/upload`, `/delete`. |
| `webapp/`        | A browser bundle that registers a route in Nginx UI, renders the file table with `antdv-next` components, and calls the backend through the host's HTTP client.          |
| `plugin.json`    | Declares the `http` capability, the `unix` listen mode, the server command, and the webapp bundle.                                                                       |

The `http` capability requires an `http` block in the manifest — `lint` rejects a manifest that declares the capability without it.

## 🐛 Troubleshooting

| Symptom                                                  | Likely cause                              | Fix                                                                                              |
| :------------------------------------------------------- | :---------------------------------------- | :----------------------------------------------------------------------------------------------- |
| _Plugin package is not signed and developer mode is off_ | Developer Mode disabled or not persisted  | Enable it under _Preferences → Plugins_, or pass `NGINX_UI_APP_DEVELOPER_MODE=true` via systemd. |
| `archive/tar: write too long`                            | Symlinks or changing files in the package | Remove `node_modules`, run `nginx-ui plugin lint ./` before packing.                             |
| `capability http requires the http block`                | Missing `http` block in `plugin.json`     | Add `"http": { "listen": "unix" }`.                                                              |
| `can't access property "items"`                          | Request hit the wrong URL                 | Use `/api/plugins/<id>/http/list` and check the Network panel.                                   |
| UI renders but no components                             | antdv bundled instead of shared           | Build with `@nginxui/plugin-sdk/vite` and import components from `antdv-next`.                   |

## 📚 References

- [Nginx UI plugin overview](https://nginxui.com/plugin/overview.html)
- [Browser bundle guide](https://nginxui.com/plugin/webapp.html)
- [Lint rules](https://nginxui.com/plugin/rules)

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

## 🤝 Contributing

Issues and pull requests are welcome. Please run `nginx-ui plugin lint ./` before submitting changes.

---

Built with ❤️ for the Nginx UI community.
