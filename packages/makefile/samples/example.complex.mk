# Exemplo complexo para testar o formatador (Format Document)
# Cobre: condicionais aninhados, define, continuações, variáveis por alvo,
# regras de padrão, include e export.


#comentario sem espaco
##doc comment sem espaco
SHELL:=/bin/bash
.DEFAULT_GOAL:=all

# Operadores de atribuição variados
NAME=app
VERSION?=1.0.0
CFLAGS   +=    -Wall -O2
BUILD_DATE!=date +%F
CACHE_DIR::=.cache
export  PREFIX:=/usr/local

# Continuações de linha
SRCS = main.c \
util.c \
io.c
OBJS = $(SRCS:.c=.o)

# Diretivas
include config.mk
-include local.mk

# Condicionais aninhados
ifeq($(OS),Windows_NT)
BIN:=$(NAME).exe
RM_CMD:=del /Q
else
ifeq ($(shell uname),Darwin)
BIN:=$(NAME)-darwin
else
ifdef CROSS_COMPILE
BIN:=$(NAME)-$(CROSS_COMPILE)
else
BIN:=$(NAME)
endif
endif
RM_CMD:=rm -rf
endif

# Bloco define preservado sem alterações (espaçamento interno intencional)
define HELP_TEXT
uso:  make [alvo]
alvos disponiveis:
build   compila o projeto
test    executa os testes
clean   remove artefatos
endef

# Variável por alvo (target-specific)
debug: CFLAGS += -g -DDEBUG
debug: build

.PHONY : all build test clean debug help

all :build test

# Regra de padrão
%.o:%.c
$(CC) $(CFLAGS) -c $< -o $@

build:$(OBJS)
$(CC) $(CFLAGS) -o $(BIN) $(OBJS)

test : build
./run-tests.sh --verbose
ifdef DEBUG
@echo "modo debug ativo"
endif

help:
@echo "$(HELP_TEXT)"

clean:
$(RM_CMD) $(BIN) *.o
$(RM_CMD) $(CACHE_DIR)

# Referências, comentários inline e define (1.0.3)
# O texto dentro de $(...) é argumento: ":", "#", "=" e espaços ficam como estão.
# O espaço entre o valor e o comentário faz parte do valor e também é mantido.
HASH_LINES:=$(shell grep -c '^#' Makefile 2>/dev/null)
NO_HASH=$(subst #,,a#b)
PREFIX:=/usr/local#sem espaço antes do comentário: o valor é /usr/local
PREFIX_SP:=/usr/local    # com espaços: eles fazem parte do valor
MODULES:=core cli
$(info módulos:   $(MODULES) em http://example.com/docs)
$(eval $(call NOTICE,a,b:c))

ifeq ($(NO_HASH),a  b)
$(warning valor inesperado: $(NO_HASH))
endif# fim da verificação

export define RELEASE_NOTES
  Versão   $(VERSION)
define INNER
  corpo   interno
endef
endef

$(MODULES:%=test_%):test_%:
	@echo "testando $*"
