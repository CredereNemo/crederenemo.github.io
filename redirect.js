(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

    function startRedirectButton() {
        $('#REDIRECT').remove();

        var servers = Lampa.Storage.get('location_servers') || [];
        if (!servers.length) return;

        var buttonHtml = '<div id="REDIRECT" class="head__action selector redirect-screen" style="width:48px;height:48px;display:flex;align-items:center;justify-content:center">' + icon_server_redirect + '</div>';

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
            window.location.href = servers[0];
            return;
        }

        var options = servers.map(server => ({
            title: server,
            callback: () => {
                window.location.href = server;
            }
        }));

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
            var servers = value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
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
