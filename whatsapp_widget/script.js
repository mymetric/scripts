// Estilos do Widget
const widgetStyles = `
    /* Estilos Gerais */
    body {
        margin: 0;
    }

    /* Botão do WhatsApp */
    .whatsapp-link {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #25d366;
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        z-index: 1000;
    }

    .whatsapp-link:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        background: #22c15e;
    }

    .whatsapp-link svg {
        width: 30px;
        height: 30px;
        fill: white;
    }

    /* Overlay do Popup */
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--popup-overlay);
        display: none;
        justify-content: var(--popup-horizontal);
        align-items: var(--popup-vertical);
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: var(--popup-backdrop-filter);
    }

    .popup-overlay.active {
        display: flex !important;
        opacity: 1;
    }

    /* Conteúdo do Popup */
    .popup-content {
        background: var(--background-primary);
        width: 90%;
        max-width: 400px;
        max-height: 650px;
        border-radius: 12px;
        overflow: hidden;
        position: fixed;
        top: auto;
        bottom: var(--popup-margin);
        left: var(--popup-horizontal) === 'left' ? 0 : auto;
        right: var(--popup-horizontal) === 'right' ? 0 : auto;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
    }

    .popup-overlay.active .popup-content {
        transform: translateY(0) !important;
    }

    /* Header do Popup */
    .popup-header {
        background: var(--secondary-gradient);
        color: var(--text-primary);
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .popup-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .header-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .popup-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }

    .close-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .close-btn svg {
        width: 24px;
        height: 24px;
    }

    /* Seção de Boas-vindas */
    .welcome-section {
        padding: 16px 20px;
        background: var(--background-primary);
    }

    .welcome-message {
        background-color: var(--background-secondary);
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 0.5px 1px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
        max-width: 85%;
        position: relative;
        display: flex;
        gap: 12px;
    }

    .welcome-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
    }

    .welcome-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .welcome-content {
        flex: 1;
    }

    .welcome-emoji {
        font-size: 24px;
        margin-bottom: 8px;
    }

    .welcome-text h3 {
        color: var(--text-title);
        font-size: 16px;
        margin-bottom: 6px;
    }

    .welcome-text p {
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.4;
        margin-bottom: 6px;
    }

    .welcome-text p:last-child {
        margin-bottom: 0;
    }

    /* Formulário */
    .contact-form {
        padding: 16px 20px;
        background: var(--background-primary);
    }

    .form-group {
        margin-bottom: 16px;
    }

    .form-group label {
        display: block;
        margin-bottom: 6px;
        color: var(--text-title);
        font-weight: 500;
        font-size: 0.9rem;
    }

    .form-group input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e9edef;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        box-sizing: border-box;
        background: var(--background-secondary);
    }

    .form-group input:focus {
        outline: none;
        border-color: var(--primary-solid);
        box-shadow: 0 0 0 2px rgba(0, 128, 105, 0.1);
    }

    .form-group input::placeholder {
        color: var(--text-secondary);
    }

    /* Botão de Envio */
    .submit-btn {
        background: var(--primary-gradient);
        color: var(--text-primary);
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px var(--shadow-primary);
    }

    .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow-hover);
    }

    .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .submit-btn svg {
        width: 20px;
        height: 20px;
    }

    /* Loading Spinner */
    .loading-spinner {
        display: none;
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .submit-btn.loading .loading-spinner {
        display: inline-block;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Responsividade */
    @media (max-width: 480px) {
        .popup-overlay {
            justify-content: var(--popup-mobile-horizontal);
            align-items: var(--popup-mobile-vertical);
            background: var(--popup-mobile-overlay);
            backdrop-filter: var(--popup-mobile-backdrop-filter);
        }

        .popup-content {
            width: 100%;
            max-width: none;
            height: 100%;
            max-height: none;
            border-radius: 0;
            margin: var(--popup-mobile-margin);
            overflow-y: auto;
            position: fixed;
            bottom: var(--popup-mobile-vertical) === 'bottom' ? 0 : auto;
            top: var(--popup-mobile-vertical) === 'top' ? 0 : auto;
            left: var(--popup-mobile-horizontal) === 'left' ? 0 : auto;
            right: var(--popup-mobile-horizontal) === 'right' ? 0 : auto;
            transform: translateY(100%);
        }

        .popup-overlay.active .popup-content {
            transform: translateY(0);
        }

        .welcome-emoji {
            font-size: 2.5rem;
        }

        .welcome-text h3 {
            font-size: 1.25rem;
        }

        .welcome-text p {
            font-size: 0.95rem;
        }

        .form-group input {
            font-size: 16px; /* Prevenir zoom em iOS */
        }
    }
`;

// Função para injetar os estilos
function injectStyles(config) {
    // Remover estilos anteriores se existirem
    const existingStyle = document.getElementById('widget-styles');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Criar variáveis CSS com as cores da configuração
    const styleVars = `
        :root {
            --primary-gradient: ${config.colors.primary.gradient};
            --primary-solid: ${config.colors.primary.solid};
            --primary-hover: ${config.colors.primary.hover};
            --secondary-gradient: ${config.colors.secondary.gradient};
            --secondary-solid: ${config.colors.secondary.solid};
            --secondary-hover: ${config.colors.secondary.hover};
            --text-primary: ${config.colors.text.primary};
            --text-secondary: ${config.colors.text.secondary};
            --text-title: ${config.colors.text.title};
            --background-primary: ${config.colors.background.primary};
            --background-secondary: ${config.colors.background.secondary};
            --background-overlay: ${config.colors.background.overlay};
            --shadow-primary: ${config.colors.shadow.primary};
            --shadow-hover: ${config.colors.shadow.hover};
            --popup-horizontal: ${config.popup.position.desktop.horizontal};
            --popup-vertical: ${config.popup.position.desktop.vertical};
            --popup-margin: ${config.popup.position.desktop.margin};
            --popup-overlay: ${config.popup.position.desktop.overlay};
            --popup-backdrop-filter: ${config.popup.position.desktop.overlay === 'none' ? 'none' : 'blur(4px)'};
            --popup-mobile-horizontal: ${config.popup.position.mobile.horizontal};
            --popup-mobile-vertical: ${config.popup.position.mobile.vertical};
            --popup-mobile-margin: ${config.popup.position.mobile.margin};
            --popup-mobile-overlay: ${config.popup.position.mobile.overlay};
            --popup-mobile-backdrop-filter: ${config.popup.position.mobile.overlay === 'none' ? 'none' : 'blur(4px)'};
        }
    `;

    // Criar e adicionar novos estilos
    const styleSheet = document.createElement('style');
    styleSheet.id = 'widget-styles';
    styleSheet.textContent = styleVars + widgetStyles;
    document.head.appendChild(styleSheet);
}

// Dados de teste
const testData = {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '11999999999'
};

// Função para verificar parâmetros da URL
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        widget: urlParams.get('mm_widget') === '1',
        test: urlParams.get('test_data') === '1'
    };
}

// Função para preencher dados de teste
function fillTestData() {
    Object.keys(testData).forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.value = testData[field];
            // Disparar evento de input para campos que precisam de formatação
            if (field === 'phone') {
                input.dispatchEvent(new Event('input'));
            }
        }
    });
}

// Função para aplicar máscara no telefone
function applyPhoneMask(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) {
        value = value.slice(0, 11);
    }
    
    if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    
    if (value.length > 10) {
        value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    
    input.value = value;
}

// Função para obter o valor do cookie mm_tracker
function getMMTracker() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'mm_tracker') {
            return value;
        }
    }
    return null;
}

// Função para criar elementos SVG
function createSVG(path, viewBox = "0 0 24 24") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("fill", "currentColor");
    
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathElement.setAttribute("d", path);
    svg.appendChild(pathElement);
    
    return svg;
}

// Função para criar o botão do WhatsApp
function createWhatsAppButton(config) {
    const button = document.createElement('a');
    button.id = 'whatsappBtn';
    button.className = 'whatsapp-link';
    button.href = `https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(config.whatsapp.message)}`;
    button.target = '_blank';
    
    const whatsappIcon = createSVG("M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z", "0 0 448 512");
    
    button.appendChild(whatsappIcon);
    
    return button;
}

// Função para criar o popup
function createPopup(config) {
    const overlay = document.createElement('div');
    overlay.id = 'popupOverlay';
    overlay.className = 'popup-overlay';
    
    const content = document.createElement('div');
    content.className = 'popup-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'popup-header';
    
    const headerLeft = document.createElement('div');
    headerLeft.className = 'popup-header-left';
    
    // Avatar do atendente no header
    if (config.welcome.attendant?.image) {
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'header-avatar';
        
        const avatarImage = document.createElement('img');
        avatarImage.src = config.welcome.attendant.image;
        avatarImage.alt = 'Atendente';
        
        avatarContainer.appendChild(avatarImage);
        headerLeft.appendChild(avatarContainer);
    }
    
    const title = document.createElement('h2');
    title.textContent = config.title;
    
    headerLeft.appendChild(title);
    
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeBtn';
    closeBtn.className = 'close-btn';
    closeBtn.appendChild(createSVG("M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"));
    
    header.appendChild(headerLeft);
    header.appendChild(closeBtn);
    
    // Welcome Section
    const welcomeSection = document.createElement('div');
    welcomeSection.className = 'welcome-section';
    
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    
    const welcomeContent = document.createElement('div');
    welcomeContent.className = 'welcome-content';
    
    const welcomeEmoji = document.createElement('div');
    welcomeEmoji.className = 'welcome-emoji';
    welcomeEmoji.textContent = config.welcome.emoji;
    
    const welcomeText = document.createElement('div');
    welcomeText.className = 'welcome-text';
    
    const welcomeTitle = document.createElement('h3');
    welcomeTitle.textContent = config.welcome.title;
    
    const welcomeMessageText = document.createElement('p');
    welcomeMessageText.textContent = config.welcome.message;
    
    const welcomeSubMessage = document.createElement('p');
    welcomeSubMessage.textContent = config.welcome.subMessage;
    
    welcomeText.appendChild(welcomeTitle);
    welcomeText.appendChild(welcomeMessageText);
    welcomeText.appendChild(welcomeSubMessage);
    
    welcomeContent.appendChild(welcomeEmoji);
    welcomeContent.appendChild(welcomeText);
    welcomeMessage.appendChild(welcomeContent);
    welcomeSection.appendChild(welcomeMessage);
    
    // Form
    const form = document.createElement('form');
    form.id = 'contactForm';
    form.className = 'contact-form';
    
    // Adicionar campos do formulário
    Object.keys(config.fields).forEach(field => {
        if (config.fields[field].enabled) {
            const group = createFormGroup(field, config.fields[field]);
            form.appendChild(group);
        }
    });
    
    // Submit Button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'submit-btn';
    
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    
    const sendIcon = createSVG("M2.01 21L23 12 2.01 3 2 10l15 2-15 2z");
    
    submitBtn.appendChild(spinner);
    submitBtn.appendChild(sendIcon);
    submitBtn.appendChild(document.createTextNode('Enviar'));
    
    form.appendChild(submitBtn);
    
    // Montar o popup
    content.appendChild(header);
    content.appendChild(welcomeSection);
    content.appendChild(form);
    overlay.appendChild(content);
    
    return overlay;
}

// Função para criar grupos de formulário
function createFormGroup(id, config) {
    const group = document.createElement('div');
    group.className = 'form-group';
    
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = config.label;
    
    const input = document.createElement('input');
    input.type = id === 'email' ? 'email' : id === 'phone' ? 'tel' : 'text';
    input.id = id;
    input.placeholder = config.placeholder;
    if (config.required) input.required = true;
    
    group.appendChild(label);
    group.appendChild(input);
    
    return group;
}

// Função para enviar eventos para o Google Analytics
function sendGAEvent(eventName, eventParams = {}) {
    if (typeof gtag === 'function' && window.widgetConfig.analytics?.measurementId) {
        const slug = window.widgetConfig.analytics.slug || '';
        const fullEventName = slug ? `${slug}_whatsapp_widget_${eventName}` : `whatsapp_widget_${eventName}`;
        
        gtag('event', fullEventName, {
            ...eventParams,
            send_to: window.widgetConfig.analytics.measurementId
        });
    }
}

// Função para inicializar o widget
function initWhatsAppWidget(config) {
    try {
        let popupOverlay = null;
        let whatsappButton = null;

        // Criar o popup
        popupOverlay = createPopup(config);
        document.body.appendChild(popupOverlay);

        // Verificar parâmetros da URL e abrir popup se mm_widget estiver presente
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mm_widget') === '1') {
            popupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            sendGAEvent('opened');
        }

        // Adicionar eventos aos elementos que correspondem ao seletor configurado
        if (config.selector && config.selector.enabled) {
            const targetElement = document.querySelector(config.selector.target);
            if (targetElement) {
                // Prevenir o comportamento padrão do link do WhatsApp
                targetElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    popupOverlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    sendGAEvent('opened');
                });
            }
        }

        // Função para lidar com o clique no botão
        const handleButtonClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            popupOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            sendGAEvent('opened');
            return false;
        };

        // Configurar o botão do WhatsApp baseado no modo de inicialização
        if (config.initialization) {
            // Converter o modo em array se for string
            const modes = Array.isArray(config.initialization.mode) 
                ? config.initialization.mode 
                : [config.initialization.mode];

            // Processar cada modo
            modes.forEach(mode => {
                switch (mode) {
                    case 'button':
                        // Criar e adicionar o botão do WhatsApp
                        if (config.initialization.createButton) {
                            whatsappButton = createWhatsAppButton(config);
                            document.body.appendChild(whatsappButton);
                            // Adicionar evento de clique no botão criado
                            whatsappButton.addEventListener('click', handleButtonClick, true); // Usando capture phase
                        }
                        break;

                    case 'trigger':
                        // Usar botões existentes
                        const buttons = document.querySelectorAll(config.initialization.buttonSelector);
                        if (buttons.length === 0) {
                            console.warn('Nenhum botão do WhatsApp encontrado com o seletor:', config.initialization.buttonSelector);
                            return;
                        }
                        // Adicionar evento de clique em todos os botões encontrados
                        buttons.forEach(button => {
                            button.addEventListener('click', handleButtonClick, true); // Usando capture phase
                        });
                        // Armazenar o primeiro botão para referência futura
                        whatsappButton = buttons[0];
                        break;
                }
            });
        }

        // Adicionar evento de máscara ao campo de telefone
        if (config.fields && config.fields.phone && config.fields.phone.enabled) {
            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                phoneInput.addEventListener('input', (e) => {
                    applyPhoneMask(e.target);
                });
            }
        }

        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popupOverlay.classList.remove('active');
                document.body.style.overflow = '';
                sendGAEvent('closed');
            });
        }

        // Adicionar evento de clique no overlay para fechar
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                popupOverlay.classList.remove('active');
                document.body.style.overflow = '';
                sendGAEvent('closed');
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
                popupOverlay.classList.remove('active');
                document.body.style.overflow = '';
                sendGAEvent('closed');
            }
        });

        // Monitorar campos do formulário
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    if (input.value.trim()) {
                        sendGAEvent(`field_${input.id}`);
                    }
                });
            });

            // Manipular envio do formulário
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = contactForm.querySelector('.submit-btn');
                submitBtn.classList.add('loading');

                const formData = {};
                Object.keys(config.fields).forEach(field => {
                    if (config.fields[field].enabled) {
                        const input = document.getElementById(field);
                        formData[field] = field === 'phone' ? input.value.replace(/\D/g, '') : input.value;
                    }
                });

                const mmTracker = getMMTracker();
                if (mmTracker) formData.mm_tracker = mmTracker;

                try {
                    const response = await fetch(config.webhook.url, {
                        method: config.webhook.method,
                        headers: config.webhook.headers,
                        body: JSON.stringify({
                            event_name: `${config.analytics.slug}_whatsapp_widget`,
                            event_params: formData
                        })
                    });

                    if (!response.ok) throw new Error('Erro ao enviar dados para o endpoint');

                    contactForm.reset();
                    popupOverlay.classList.remove('active');
                    sendGAEvent('completed', formData);
                    fbq('track', 'Lead');
                    
                    // Abrir WhatsApp após envio bem-sucedido
                    let whatsappMessage = config.whatsapp.message;
                    
                    // Verifica se o campo email existe e está habilitado
                    if (config.fields.email?.enabled && formData.email) {
                        // Substitui o marcador ||email|| pelo email do usuário
                        whatsappMessage = whatsappMessage.replace(/\|\|email\|\|/g, formData.email);
                    }
                    
                    window.open(`https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                } catch (error) {
                    console.error('Erro:', error);
                } finally {
                    submitBtn.classList.remove('loading');
                }
            });
        }
        
        return { popupOverlay };
    } catch (error) {
        console.error('Erro ao inicializar o widget:', error);
        return { popupOverlay: null };
    }
}

// Função principal que encapsula todo o código
function initWidget(config) {
    // Injetar estilos
    injectStyles(config);

    // Inicializar o widget
    const { popupOverlay } = initWhatsAppWidget(config);

    // Preencher dados de teste se necessário
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test_data') === '1') {
        fillTestData();
    }
}

// Expor apenas a função initWidget globalmente
(function(window) {
    window.initWidget = initWidget;
})(window); 
