# File Manager

A `dns01` challenge plugin for nginx-ui, scaffolded by `nginx-ui plugin init`.
See the [plugin development guide](https://nginxui.com/plugin/overview)
for everything a plugin can do.

## Capability

Implements the `dns01` capability for the `filemanager` provider:
`dns01.present` publishes the ACME challenge TXT record, `dns01.cleanup`
removes it. See the [DNS-01 guide](https://nginxui.com/plugin/capabilities/dns01).

## Permissions

This plugin requests the `network` permission: its own process talks to the
`File Manager` API directly, the host is not involved in that traffic.

## Supported platforms

Runs anywhere `node` is available on `PATH`.

## Development

* `nginx-ui plugin lint .` checks the plugin files.
* `nginx-ui plugin conformance .` runs it through the conformance cases.

## Publishing

1. `nginx-ui plugin key init --id io.github.aurakomputer.filemanager` creates a primary key, a signing
   key and the certificate that links them. Keep `primary.key` offline, put
   `signing.key` into the secrets of your CI, and commit `plugin.signer` and
   `plugin.signer.minisig`.
2. `nginx-ui plugin pack . io.github.aurakomputer.filemanager-<version>.tar.gz --key signing.key` signs a
   package and packs the certificate with it.
3. Publish the packages on a GitHub Release and submit the plugin to the
   catalog, see [Catalogs](https://nginxui.com/plugin/catalog).

TODO: fill in `FILEMANAGER_API_TOKEN` handling in `present`/`cleanup` and adjust
`plugin.json`'s `dns01.providers[0].form` fields to match the real
`File Manager` API.
