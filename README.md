# build-rpm

<a href="https://github.com/Antikythera/build-rpm/actions"><img alt="build-rpm status" src="https://github.com/Antikythera/build-rpm/workflows/test/badge.svg"></a>

</p>

This action builds a RPM package for Centos7.

## Usage

Basic:

```yml
- steps:
    - uses: Antikythera/build-rpm@v1
      id: build_rpm
      with:
        spec_file: my_app.spec
        sources: |
          path/to/source.tar.gz

    - name: Upload RPM
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ github.token }}
        with:
          upload_url: my_app.rpm
          asset_path: ${{ steps.build_rpm.outputs.rpm_package_path }}
          asset_name: ${{ steps.build_rpm.outputs.rpm_package_name }}
          asset_content_type: application/octet-stream
```
