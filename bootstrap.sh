#!/bin/sh
# setting variables
PWD=$(dirname $(readlink -f $0))
DISTRIBUTION=$(lsb_release -i | cut -f 2)

# installing pre-requisites
if [ "$DISTRIBUTION" = 'Arch' ];
then
	if ! command -v ansible >/dev/null 2>&1;
	then
		sudo pacman -S --needed ansible
	fi
	# running playbook
	if [ -f ~/.ssh/id_ed25519 ];
	then
		ansible-playbook $PWD/local.yml -i $PWD/hosts -l $(hostname -f)
	else
		ansible-playbook $PWD/local.yml -i $PWD/hosts -l $(hostname -f) --ask-vault-pass
	fi
elif [ "$DISTRIBUTION" = 'Debian' ];
then
	if ! command -v 'ansible' >/dev/null 2>&1;
	then
		sudo apt install ansible
	fi
	# running playbook
	if [ -f ~/.ssh/id_ed25519 ];
	then
		ansible-playbook $PWD/local.yml -i $PWD/hosts -l $(hostname -f)
	else
		ansible-playbook $PWD/local.yml -i $PWD/hosts -l $(hostname -f) --ask-vault-pass
	fi
else
	echo "This script only supports Arch and Debian derivitives."
fi
