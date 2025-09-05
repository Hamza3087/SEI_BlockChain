#!/bin/sh

set -e

usage_msg="Usage: $0 [-f|--autoformat] [-c|--container]"
cmd_prefix="poetry run"

case "$1" in
-h|--help|help)
  echo "$usage_msg"
  exit
  ;;
-f|--autoformat)
  ;;
-c|--container)
  cmd_prefix=""
  ;;
"")
  # lint
  black_flags="--check"
  isort_flags="--check"
  ;;
*)
  echo "$usage_msg"
  exit 1
  ;;
esac

echo "Type checking..."
${cmd_prefix} mypy .
echo "Formatting..."
${cmd_prefix} black . $black_flags
${cmd_prefix} isort . $isort_flags
echo "Linting..."
${cmd_prefix} flake8
echo "Checking migrations..."
${cmd_prefix} python manage.py makemigrations --dry-run --no-input --check
