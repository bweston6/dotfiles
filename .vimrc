call plug#begin()
Plug 'lervag/vimtex'
Plug 'ajh17/VimCompletesMe'
call plug#end()

set spelllang=en_gb
set spell
imap <c-f> <c-g>u<Esc>[s1z=`]a<c-g>u
nmap <c-f> [s1z=<c-o>

set number
set relativenumber

set mouse=a
set clipboard=unnamedplus

let g:tex_flavor = 'latex'
let g:vimtex_view_method = 'zathura'
augroup VimCompletesMeTex
	autocmd!
	autocmd FileType tex
				\ let b:vcm_omni_pattern = g:vimtex#re#neocomplete
augroup END

noremap <Leader>s :update<CR>
