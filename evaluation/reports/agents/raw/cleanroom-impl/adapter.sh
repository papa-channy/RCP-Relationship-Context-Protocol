#!/bin/sh
exec /usr/bin/env node --disable-warning=ExperimentalWarning "$(dirname "$0")/src/adapter.ts"
