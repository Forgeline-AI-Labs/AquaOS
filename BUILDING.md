# Building AquaOS

## Prerequisites

- **Go 1.23.2+** — [install instructions](https://go.dev/doc/install)
- **Git** — for version tagging during build
- **Make** (optional) — the Makefile wraps the Go build commands

## Backend (Go)

The backend source lives in `backend/`. It is a standard Go module
(`github.com/reef-pi/reef-pi`).

### Quick build

```bash
cd backend
make go            # builds bin/reef-pi
```

Or without Make:

```bash
cd backend
go build -o bin/reef-pi -ldflags "-s -w -X main.Version=$(git describe --always --tags)" ./commands
```

### Verify the build

```bash
./bin/reef-pi -version   # prints the embedded version string
```

### Run tests

```bash
cd backend
go test -count=1 ./...
```

### Cross-compile

```bash
make pi          # linux/arm   (Raspberry Pi 3/4/5)
make pi-zero     # linux/arm6  (Raspberry Pi Zero)
make x86         # linux/amd64
```

### Other useful targets

| Target       | Description                        |
|--------------|------------------------------------|
| `make lint`  | Format check (`gofmt`, `goimports`, `go vet`) |
| `make test`  | Tests with race detector           |
| `make clean` | Remove build artifacts             |

## Frontend

See `frontend/` — the Next.js frontend is built and developed separately
from the backend. Refer to `frontend/package.json` for scripts.
