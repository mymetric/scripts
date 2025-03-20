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
            message: 'Mensagem padrão do WhatsApp'
        },
        initialization: {
            mode: 'auto', // 'auto' | 'button' | 'trigger'
            buttonSelector: '#whatsappBtn', // Seletor do botão existente (usado quando mode é 'trigger')
            createButton: true // Se deve criar o botão (usado quando mode é 'button')
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
    script.src = 'https://cdn.jsdelivr.net/gh/mymetric/scripts@a41d89667ac2f1b542e0f3dbba54457fe33b047b/whatsapp_widget.js';
    
    script.onload = function () {
        window.initWidget(widgetConfig);
    };
    document.body.appendChild(script);
</script>
```

## Modos de Inicialização

### 1. Modo Automático (`auto`)
```javascript
initialization: {
    mode: 'auto'
}
```
- O popup é criado mas não é adicionado nenhum botão
- O popup abre automaticamente se o parâmetro `mm_widget=1` estiver presente na URL
- Útil para integrações onde você quer controlar quando o popup abre via URL

### 2. Modo Botão (`button`)
```javascript
initialization: {
    mode: 'button',
    createButton: true
}
```
- Cria um novo botão do WhatsApp
- O popup abre quando o botão é clicado
- Útil quando você quer que o widget crie seu próprio botão

### 3. Modo Trigger (`trigger`)
```javascript
initialization: {
    mode: 'trigger',
    buttonSelector: '#meu-botao-whatsapp'
}
```
- Usa um botão existente na página
- O popup abre quando o botão existente é clicado
- Útil quando você já tem um botão na página e quer apenas adicionar a funcionalidade do popup

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
