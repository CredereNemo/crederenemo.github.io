(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24" height="24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25ZM10 3.75H14V2.25H10V3.75Z"></path></svg>';
    
    function openServerSelection() {
        var servers = Lampa.Storage.get('location_servers') || [];
        
        if (!Array.isArray(servers) || servers.length === 0) {
            Lampa.Noty.show('Список серверов пуст');
            return;
        }
        
        Lampa.Modal.open({
            title: 'Выберите сервер',
            html: Lampa.Template.js(`
                <div>
                    ${servers.map(server => `<div class="server-option selector" data-server="${server}">${server}</div>`).join('')}
                </div>
            `),
            onBack: () => Lampa.Modal.close(),
        });
        
        $('.server-option').on('hover:enter', function() {
            var selectedServer = $(this).data('server');
            window.location.href = server_protocol + selectedServer;
        });
    }
    
    function startMe() {
        $('#REDIRECT').remove();
        var buttonHTML = `<div id="REDIRECT" class="head__action selector redirect-screen">${icon_server_redirect}</div>`;
        $('#app > div.head > div > div.head__actions').append(buttonHTML);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
        
        $('#REDIRECT').on('hover:enter', openServerSelection);
    }
    
    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: icon_server_redirect
    });
    
    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'location_servers',
            type: 'input',
            values: '',
            placeholder: 'Введите список серверов через запятую',
            default: ''
        },
        field: {
            name: 'Список серверов',
            description: 'Введите список серверов через запятую, затем нажмите кнопку в верхнем баре'
        },
        onChange: function (value) {
            Lampa.Storage.set('location_servers', value.split(',').map(s => s.trim()));
            startMe();
        }
    });
    
    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startMe();
        });
    }
})();

