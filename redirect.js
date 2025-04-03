(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25Z"></path></svg>';

    function startRedirectButton() {
        $('#REDIRECT').remove();
        
        var servers = Lampa.Storage.get('location_servers') || [];
        if (!servers.length) return; // Если серверов нет, не создаем кнопку
        
        var buttonHtml = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
        
        $('.head__actions').append(buttonHtml);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

        $('#REDIRECT').on('hover:enter', function() {
            openServerSelection();
        });
    }

    function openServerSelection() {
        var servers = Lampa.Storage.get('location_servers') || [];
        
        if (!servers.length) {
            Lampa.Noty.show('Нет доступных серверов');
            return;
        }
        
        if (servers.length === 1) {
            window.location.href = server_protocol + servers[0];
            return;
        }
        
        var options = servers.map(server => ({ title: server, callback: () => {
            window.location.href = server_protocol + server;
        }}));
        
        Lampa.Select.show({
            title: 'Выберите сервер',
            items: options,
            onSelect: (item) => item.callback()
        });
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
            placeholder: 'Введите адреса через запятую',
            default: ''
        },
        field: {
            name: 'Серверы',
            description: 'Введите серверы через запятую для выбора'
        },
        onChange: function (value) {
            var servers = value.split(',').map(s => s.trim()).filter(Boolean);
            Lampa.Storage.set('location_servers', servers);
            startRedirectButton();
        }
    });
    
    if (window.appready) startRedirectButton();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startRedirectButton();
        });
    }
})();
