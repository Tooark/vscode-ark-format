#!/usr/bin/env bash

# Bash-specific example
# Features: arrays, ${var[@]}, string manipulation



# Associative array
declare -A config
config[host]="localhost"
config[port]="8080"
config[debug]="true"

# Process array elements
for key in "${!config[@]}";do
echo "${key}=${config[$key]}"
done

# String manipulation
filename="archive-2024.tar.gz"
echo "Basename: ${filename%.*.*}"
echo "Extension: ${filename##*.}"

# Bash printf formatting
printf "Server: %s:%d\n" "${config[host]}" "${config[port]}"

# Conditional expansion
user=${USERNAME:-nobody}
echo "Running as: $user"

# Process substitution
while read -r line;do
echo "Line: $line"
done <(grep -r "TODO" /path/to/src 2>/dev/null || echo "No TODOs found")



# Function with local variables
build_package(){
local version=$1
local output_dir="${2:-.}"

if [[ -z "$version" ]];then
echo "Error: version required" >&2
return 1
fi

echo "Building version: $version"
mkdir -p "$output_dir"
}

# Call function
build_package "1.0.0" "dist/"