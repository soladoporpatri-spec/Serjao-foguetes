//cabecalho e menu
const cabecalho = document.querySelector('.cabecalho-site');
const botaoMenu = document.querySelector('.botao-menu');
const botaoFecharMenu = document.querySelector('.fechar-menu');
const menuMobile = document.querySelector('.menu-mobile');
const linksMenuMobile = menuMobile.querySelectorAll('a');

//formulario de interesse
const formularioInteresse = document.querySelector('#formulario-interesse');
const seletorPlano = document.querySelector('#plano');
const campoTelefone = document.querySelector('#telefone');
const painelSucesso = document.querySelector('#sucesso-formulario');
const botaoNovaSolicitacao = document.querySelector('#nova-solicitacao');

//aqui fecha e abre o menu
const atualizarEstadoMenu = (aberto) => {
    menuMobile.classList.toggle('esta-aberto', aberto);
    document.body.classList.toggle('menu-aberto', aberto);
    botaoMenu.setAttribute('aria-expanded', String(aberto));
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    menuMobile.setAttribute('aria-hidden', String(!aberto));

    if (aberto) {
        botaoFecharMenu.focus();
    } else if (document.activeElement === botaoFecharMenu) {
        botaoMenu.focus();
    }
};

botaoMenu.addEventListener('click', () => atualizarEstadoMenu(botaoMenu.getAttribute('aria-expanded') !== 'true'));
botaoFecharMenu.addEventListener('click', () => atualizarEstadoMenu(false));
linksMenuMobile.forEach((link) => link.addEventListener('click', () => atualizarEstadoMenu(false)));

document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && menuMobile.classList.contains('esta-aberto')) {
        atualizarEstadoMenu(false);
    }
});

//aqui muda o cabecalho quando a pagina desce
const atualizarCabecalho = () => cabecalho.classList.toggle('esta-rolado', window.scrollY > 28);
atualizarCabecalho();
window.addEventListener('scroll', atualizarCabecalho, { passive: true });

//aqui é a animação quando cada seção aparece
const itensParaRevelar = document.querySelectorAll('.revelar');
const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (movimentoReduzido || !('IntersectionObserver' in window)) {
    itensParaRevelar.forEach((item) => item.classList.add('esta-visivel'));
} else {
    const observadorRevelacao = new IntersectionObserver((entradas, observador) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('esta-visivel');
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    itensParaRevelar.forEach((item) => observadorRevelacao.observe(item));
}

//aqui escolhe o plano antes de abrir o formulario
const selecionarPlanoSolicitado = (plano) => {
    const planoExiste = Array.from(seletorPlano.options).some((opcao) => opcao.value === plano);
    if (planoExiste) seletorPlano.value = plano;
};

document.querySelectorAll('[data-plan]').forEach((controle) => {
    controle.addEventListener('click', () => selecionarPlanoSolicitado(controle.dataset.plan));
});

document.querySelectorAll('.selecionar-plano').forEach((botao) => {
    botao.addEventListener('click', () => {
        selecionarPlanoSolicitado(botao.dataset.plan);
        document.querySelector('#contato').scrollIntoView({ behavior: movimentoReduzido ? 'auto' : 'smooth' });
        window.setTimeout(() => document.querySelector('#nome').focus(), movimentoReduzido ? 0 : 650);
    });
});

//aqui formata o telefone
campoTelefone.addEventListener('input', () => {
    const numeros = campoTelefone.value.replace(/\D/g, '').slice(0, 11);
    let telefoneFormatado = numeros;

    if (numeros.length > 2) telefoneFormatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length > 7) telefoneFormatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;

    campoTelefone.value = telefoneFormatado;
});

const mostrarErroCampo = (campo, mensagem) => {
    const erro = document.querySelector(`#erro-${campo.id}`);
    campo.setAttribute('aria-invalid', String(Boolean(mensagem)));
    campo.setAttribute('aria-describedby', erro.id);
    erro.textContent = mensagem;
};

//aqui valida o formulario
const validarFormulario = () => {
    const campoNome = document.querySelector('#nome');
    const campoCidade = document.querySelector('#cidade');
    const campoEstado = document.querySelector('#estado');
    const numerosTelefone = campoTelefone.value.replace(/\D/g, '');
    let formularioValido = true;

    if (campoNome.value.trim().length < 2) {
        mostrarErroCampo(campoNome, 'Digite seu nome.');
        formularioValido = false;
    } else {
        mostrarErroCampo(campoNome, '');
    }

    if (numerosTelefone.length < 10) {
        mostrarErroCampo(campoTelefone, 'Digite um telefone com DDD.');
        formularioValido = false;
    } else {
        mostrarErroCampo(campoTelefone, '');
    }

    if (campoCidade.value.trim().length < 2) {
        mostrarErroCampo(campoCidade, 'Informe sua cidade.');
        formularioValido = false;
    } else {
        mostrarErroCampo(campoCidade, '');
    }

    if (!campoEstado.value) {
        mostrarErroCampo(campoEstado, 'Selecione seu estado.');
        formularioValido = false;
    } else {
        mostrarErroCampo(campoEstado, '');
    }

    if (!formularioValido) {
        formularioInteresse.querySelector('[aria-invalid="true"]').focus();
    }

    return formularioValido;
};

formularioInteresse.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!validarFormulario()) return;

    painelSucesso.hidden = false;
    painelSucesso.focus();
});

//aqui limpa os campos para uma nova solicitação
botaoNovaSolicitacao.addEventListener('click', () => {
    painelSucesso.hidden = true;
    formularioInteresse.reset();
    seletorPlano.value = 'Aether';
    document.querySelectorAll('.erro-campo').forEach((erro) => { erro.textContent = ''; });
    document.querySelectorAll('[aria-invalid]').forEach((campo) => campo.removeAttribute('aria-invalid'));
    document.querySelector('#nome').focus();
});
