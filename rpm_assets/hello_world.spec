Name:       hello-world
Version:    %{_version}
Release:    1%{?dist}
Summary:    Simplest RPM package

License:    MIT
Source0:    hello-world-%{_version}.tar.gz

BuildArch:  noarch

%description
This is a test RPM package, which does nothing.

%prep
%setup -q 

%build
cat > hello-world.sh <<EOF
#!/usr/bin/bash
echo Hello world
echo foo %{_foo}
EOF

%install
mkdir -p %{buildroot}/usr/bin/
install -m 755 hello-world.sh %{buildroot}/usr/bin/hello-world.sh
install -m 755 hello.sh %{buildroot}/usr/bin/hello.sh

%files
/usr/bin/hello-world.sh
/usr/bin/hello.sh

%changelog