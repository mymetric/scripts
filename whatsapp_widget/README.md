# WhatsApp Widget

## Visão Geral
O WhatsApp Widget é uma solução flexível que permite adicionar um botão de contato via WhatsApp em qualquer site, com diferentes opções de inicialização e personalização.

## Instalação

### 1. Adicione o Script
```html
<script>
    // Configuração do widget
    var widgetConfig = {
        title: 'Atendimento',
        whatsapp: {
            number: 'SEU_NUMERO_AQUI', // Ex: '5531992251502'
            message: 'Mensagem padrão do WhatsApp. Meu email é ||email||.' // É possível acrescentar o email na mensagem com a variável ||email||
        },
        initialization: {
            mode: ['button', 'trigger'], // Uma lista com uma ou mais opções disponveis 'button' e 'trigger'
            buttonSelector: '#whatsappBtn', // Seletor do botão existente (usado quando mode é 'trigger')
            createButton: true, // Se deve criar o botão (usado quando mode é 'button')
            openSelector: '[data-whatsapp-widget="open"]' // Seletor CSS para elementos que devem abrir o popup
        },
        colors: {
            primary: { gradient: 'linear-gradient(135deg, #FF3300, #E62E00)', solid: '#FF3300', hover: '#E62E00' },
            secondary: { gradient: 'linear-gradient(135deg, #FF3300, #E62E00)', solid: '#FF3300', hover: '#E62E00' },
            text: { primary: '#ffffff', secondary: '#667781', title: '#FF3300' },
            background: { primary: '#EEE9E0', secondary: '#ffffff', overlay: 'rgba(0, 0, 0, 0.5)' },
            shadow: { primary: 'rgba(255, 51, 0, 0.3)', hover: 'rgba(255, 51, 0, 0.4)' }
        },
        popup: {
            position: {
                desktop: { horizontal: 'right', vertical: 'bottom', margin: '110px', overlay: 'none' },
                mobile: { horizontal: 'center', vertical: 'center', margin: '0', overlay: 'rgba(0, 0, 0, 0.5)' }
            }
        },
        welcome: {
            emoji: '',
            title: 'Precisa de ajuda?',
            message: 'Converse com uma personal shopper!',
            subMessage: 'Preencha os dados abaixo para começar.',
            attendant: {
                image: 'URL_DA_IMAGEM_DO_ATENDENTE'
            }
        },
        fields: {
            name: { enabled: true, label: 'Nome', placeholder: 'Digite seu nome', required: true },
            email: { enabled: true, label: 'Email', placeholder: 'Digite seu email', required: true },
            phone: { enabled: true, label: 'Telefone', placeholder: '(XX) XXXXX-XXXX', required: true }
        },
        webhook: {
            url: 'URL_DO_SEU_WEBHOOK',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        analytics: { 
            measurementId: 'SEU_ID_DO_GOOGLE_ANALYTICS',
            slug: 'IDENTIFICADOR_DO_WIDGET' // Ex: 'gringa'
        }
    };
    
    // Carregar o script dinamicamente
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/mymetric/scripts@39253acaf2d2ca21aafe5faaf266548d956ae08b/whatsapp_widget/script.js';
    
    script.onload = function () {
        window.initWidget(widgetConfig);
    };
    document.body.appendChild(script);
</script>
```

## Modos de Inicialização

### 1. Modo Botão (`button`)
```javascript
initialization: {
    mode: ['button'],
    createButton: true
}
```
- Cria um novo botão do WhatsApp
- O popup abre quando o botão é clicado
- Útil quando você quer que o widget crie seu próprio botão

### 2. Modo Trigger (`trigger`)
```javascript
initialization: {
    mode: ['trigger'],
    buttonSelector: '#meu-botao-whatsapp'
}
```
- Usa um botão existente na página
- O popup abre quando o botão existente é clicado
- Útil quando você já tem um botão na página e quer apenas adicionar a funcionalidade do popup

### Abrindo o Popup via Seletor CSS
Você pode configurar um seletor CSS para abrir o popup e prevenir o comportamento padrão dos elementos. Para isso, adicione a propriedade `openSelector` na configuração de inicialização:

```javascript
initialization: {
    mode: 'button',
    createButton: true,
    openSelector: '[data-whatsapp-widget="open"]' // Seletor CSS personalizado
}
```

E adicione o atributo correspondente aos elementos desejados:

```html
<!-- Exemplo com link -->
<a href="#" data-whatsapp-widget="open">Fale Conosco</a>

<!-- Exemplo com botão -->
<button data-whatsapp-widget="open">Iniciar Conversa</button>
```

O widget irá automaticamente:
- Prevenir o comportamento padrão dos elementos que correspondem ao seletor
- Abrir o popup quando os elementos forem clicados
- Enviar o evento de abertura para o Google Analytics

### Comportamento do Parâmetro mm_widget
Independentemente do modo de inicialização escolhido, o popup será aberto automaticamente se o parâmetro `mm_widget=1` estiver presente na URL. Isso permite que você controle a abertura do popup via URL mesmo quando usando os modos `button` ou `trigger`.

## Personalização

### Cores
```javascript
colors: {
    primary: { gradient: 'linear-gradient(135deg, #FF3300, #E62E00)', solid: '#FF3300', hover: '#E62E00' },
    secondary: { gradient: 'linear-gradient(135deg, #FF3300, #E62E00)', solid: '#FF3300', hover: '#E62E00' },
    text: { primary: '#ffffff', secondary: '#667781', title: '#FF3300' },
    background: { primary: '#EEE9E0', secondary: '#ffffff', overlay: 'rgba(0, 0, 0, 0.5)' },
    shadow: { primary: 'rgba(255, 51, 0, 0.3)', hover: 'rgba(255, 51, 0, 0.4)' }
}
```

### Posição do Popup
```javascript
popup: {
    position: {
        desktop: { horizontal: 'right', vertical: 'bottom', margin: '110px', overlay: 'none' },
        mobile: { horizontal: 'center', vertical: 'center', margin: '0', overlay: 'rgba(0, 0, 0, 0.5)' }
    }
}
```

### Campos do Formulário
```javascript
fields: {
    name: { enabled: true, label: 'Nome', placeholder: 'Digite seu nome', required: true },
    email: { enabled: true, label: 'Email', placeholder: 'Digite seu email', required: true },
    phone: { enabled: true, label: 'Telefone', placeholder: '(XX) XXXXX-XXXX', required: true }
}
```

## Eventos e Analytics

### Eventos do Google Analytics
O widget envia automaticamente os seguintes eventos:
- `{slug}_whatsapp_widget_opened`: Quando o popup é aberto
- `{slug}_whatsapp_widget_closed`: Quando o popup é fechado
- `{slug}_whatsapp_widget_field_{field}`: Quando um campo é preenchido
- `{slug}_whatsapp_widget_completed`: Quando o formulário é enviado com sucesso

### Webhook
O payload enviado para o webhook tem o formato:
```javascript
{
    event_name: "{slug}_whatsapp_widget",
    event_params: {
        name: "...",
        email: "...",
        phone: "...",
        mm_tracker: "..." // se disponível
    }
}
```

## Teste
Para testar o widget, você pode usar os seguintes parâmetros na URL:
- `?mm_widget=1`: Abre o popup automaticamente
- `?test_data=1`: Preenche o formulário com dados de teste

## Exemplo de Uso
```html
<!-- Abrir o popup automaticamente -->
<a href="seu-site.com?mm_widget=1">Abrir Widget</a>

<!-- Abrir o popup com dados de teste -->
<a href="seu-site.com?mm_widget=1&test_data=1">Abrir Widget com Dados de Teste</a>
```

## Requisitos
- Navegador moderno com suporte a JavaScript ES6+
- Conexão com internet para carregar o script do CDN
- Google Analytics configurado (opcional, para tracking de eventos) 
