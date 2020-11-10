Name:       hello-world
Version:    %{_version}
Release:    1%{?dist}
Summary:    Simplest RPM package
License:    MIT

%description
This is a test RPM package, which does nothing.

%prep

%build
cat > hello-world.sh <<EOF
#!/usr/bin/bash
echo Hello world
echo foo %{_foo}
EOF

%install
mkdir -p %{buildroot}/usr/bin/
install -m 755 hello-world.sh %{buildroot}/usr/bin/hello-world.sh

%files
/usr/bin/hello-world.sh

%changelog