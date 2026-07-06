# Exemplo de GNUmakefile desconfigurado (recipes sem TAB) para testar o formatador
# Demonstra funções do GNU make e recipes com continuação.

PROJECT := gnu-sample
SOURCES := $(wildcard src/*.c)
OBJECTS := $(patsubst src/%.c,build/%.o,$(SOURCES))
UPPER := $(shell echo $(PROJECT) | tr a-z A-Z)

.PHONY: all info clean

all: info $(OBJECTS)

info:
@echo "Projeto: $(PROJECT) ($(UPPER))"
@echo "Fontes:     $(SOURCES)"

build/%.o: src/%.c
@mkdir -p build
$(CC) $(CFLAGS) \
-c $< \
-o $@

clean:
rm -rf build
