# Exemplo de Makefile desconfigurado (recipes sem TAB) para testar o formatador

# comentario sem espaco
SHELL := /bin/bash
VERSION ?= 1.0.0
CFLAGS += -Wall -O2
SRCS = main.c \
util.c \
io.c

ifeq ($(OS),Windows_NT)
BIN := app.exe
else
ifeq ($(shell uname),Darwin)
BIN := app-darwin
else
BIN := app
endif
endif

define HELP_TEXT
uso:  make [alvo]
alvos:   build   test   clean
endef

.PHONY: all build test clean

all: build test

build: $(SRCS)
$(CC) $(CFLAGS) -o $(BIN) $(SRCS)

test: build
./run-tests.sh --verbose
ifdef DEBUG
@echo "modo debug"
endif

clean:
rm -rf $(BIN) *.o
