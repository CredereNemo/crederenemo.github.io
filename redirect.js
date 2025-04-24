(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5 12l7-7v4h6v6h-6v4l-7-7zm14 7v-6h2v6h-2zm-2-8h2V5h-2v6z"/></svg>';

    function startRedirectButton() {
        $('#REDIRECT').remove();
        var servers = Lampa.Storage.get('location_servers') || [];
        
        if (!servers.length) return;
        
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
            // Преобразуем каждый адрес в нижний регистр
            var servers = value.split(',')
                .map(s => s.trim().toLowerCase())
                .filter(Boolean);

            // Обновляем хранилище
            Lampa.Storage.set('location_servers', servers);

            // Обновляем поле ввода значением в нижнем регистре
            this.input.val(servers.join(','));

            // Обновляем кнопку
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
