#!/bin/sh
# setting variables
DISTRIBUTION=$(lsb_release -i | cut -f 2)

# installing pre-requisites
if [ "$DISTRIBUTION" = 'Arch' ];
then
	if ! command -v 'ansible' >/dev/null 2>&1;
	then
		sudo pacman -S --needed --noconfirm ansible inetutils
	fi
	if ! command -v 'hostname' >/dev/null 2>&1;
	then
		sudo pacman -S --needed --noconfirm inetutils
	fi
	# running playbook
	PWD=$(dirname $(readlink -f $0))
	if [ -f ~/.ssh/id_ed25519 ];
	then
		ansible-playbook $PWD/local.yml -i $PWD/hosts -l $(hostname -f)
	else
		ansible-playbook $PWD/local.yml -i $PWD/hosts -l $(hostname -f) --ask-vault-pass
	fi
elif [ "$DISTRIBUTION" = 'Debian' -o "$DISTRIBUTION" = 'Raspbian' ];
then
	if ! command -v 'ansible' >/dev/null 2>&1;
	then
		sudo apt install ansible
	fi
	# running playbook
	PWD=$(dirname $(readlink -f $0))
	if [ -f ~/.ssh/id_ed25519 ];
	then
		ansible-playbook $PWD/local.yml -i $PWD/hosts -l $(hostname -f)
	else
		ansible-playbook $PWD/local.yml -i $PWD/hosts -l $(hostname -f) --ask-vault-pass
	fi
else
	echo "This script only supports Arch and Debian derivitives."
fi
