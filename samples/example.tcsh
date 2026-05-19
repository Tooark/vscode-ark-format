#!/usr/bin/env tcsh
# C Shell (tcsh) example
# Note: tcsh is csh-compatible but with enhancements

# Variable declarations
set application = "MyApp"
set version = "2.0"
set configdir = ~/.config/myapp

# List (array in tcsh)
set services = (apache mysql redis)

# Iterate over list
foreach svc ($services)
  echo "Service: $svc"
end

# Arithmetic using @ operator
@ counter = 0
@ counter = $counter + 10

echo "Counter: $counter"

# String manipulation
set filename = "backup-2024.tar.gz"
set basename = $filename:r
set extension = $filename:e

echo "Basename: $basename"
echo "Extension: $extension"

# Conditional with switch/case
switch ($1)
case "start":
  echo "Starting $application..."
  breaksw
case "stop":
  echo "Stopping $application..."
  breaksw
case "restart":
  echo "Restarting $application..."
  breaksw
default:
  echo "Unknown command"
  breaksw
endsw

# Redirect to file
echo "Log entry at $(date)" >> ~/.logs/myapp.log

# Command substitution with backticks (older style)
set current_user = `whoami`
set system_time = `date +%H:%M:%S`

echo "User: $current_user, Time: $system_time"

# Conditional expression
if (-d $configdir) then
  echo "Config directory exists"
else
  echo "Creating config directory"
  mkdir -p $configdir
endif

# Test file permissions
if (-r $configdir && -w $configdir) then
  echo "Config directory is readable and writable"
endif

# Function definition
set cleanupfiles = 0
alias cleanup "rm -f /tmp/myapp_*; @ cleanupfiles++"

# Use alias
cleanup

echo "Cleaned up $cleanupfiles operations"
