#!/usr/bin/env ksh

# Korn Shell (ksh) specific example
# Features: POSIX + advanced array handling, arithmetic

# KSH arithmetic (more efficient than $(()))
integer counter=0
integer max_retries=3

# Arrays (indexed from 0 in modern ksh)
typeset -a services=("nginx" "postgres" "redis" "memcached")

# Arithmetic evaluation
(( counter++ ))
echo "Counter is now: $counter"



# Array iteration with loop
for svc in "${services[@]}";do
echo "Service: $svc"
(( counter += 10 ))
done

echo "Total counter: $counter"

# Here string (supported in ksh93+)
while IFS=: read -r key value;do
echo "Key=$key Value=$value"
done <<<$(grep ^[a-z] /etc/config)

# Command substitution with coprocess
print "hostname" |& ksh
read -p result

echo "Coprocess result: $result"

# Extended pattern matching
filename="archive-backup-2024-01-15.tar.gz"
if [[ "$filename" == +(archive-backup-)+([0-9])-+([0-9])-+([0-9]).tar.gz ]];then
echo "Valid backup archive name"
fi

# POSIX character class in pattern
if [[ "$filename" == *[[:digit:]]*[[:digit:]]-[[:digit:]]*[[:digit:]]-* ]];then
echo "Contains date pattern"
fi

# Declare function as external
typeset -f list_services
list_services(){
for s in "${services[@]}";do
print "  - $s"
done
}

print "Active services:"
list_services