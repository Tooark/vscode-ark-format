
#!/bin/bash

# Basic if/then
if [ "$1" = "ok" ];then
echo "ok"
fi

# Nested if/else
if [ -f "file.txt" ]; then
if [ -r "file.txt" ];then
echo "readable"
else
echo "not readable"
fi
fi

# Function definitions
myfunc(){
echo "hello"
}

function another_func{
echo "world"
}

function with_parens()  {
echo "parens"
}



# Case with ;& and ;;&
case "$1" in
start)
echo "starting"
;&
restart)
echo "restarting"
;;
stop)
echo "stopping"
;;&
*)
echo "default"
;;
esac

# Heredoc
cat <<EOF
  This is a heredoc
  Indentation preserved
EOF

cat <<'QUOTED'
  Quoted heredoc $NOT_EXPANDED
QUOTED

# Heredoc in quotes (should NOT trigger heredoc mode)
echo "cat <<EOF is not a heredoc"
echo "normal line after"

# Line continuation
curl -X POST \
--header "Content-Type: application/json" \
--data '{"key": "value"}' \
http://localhost:8080/api

# For and while loops
for i in 1 2 3;do
echo $i
done

while [ true ];do
echo "loop"
break
done



# Escaped quotes
echo "say \"hello\" world"
echo "path is C:\\Users"

# ANSI-C quoting
echo $'hello\nworld'

# Collapse spaces (outside strings)
echo   "hello   world"   foo

# Word boundary edge cases (should NOT be treated as keywords)
final_count=0
done_flag=true
fisher_price="toy"
