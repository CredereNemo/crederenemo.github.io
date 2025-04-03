(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = Lampa.Storage.get('servers') || [];

    function updateIcon() {
        $('#REDIRECT').remove();
        if (servers.length === 0) return;

        var icon_server_redirect = '<svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">...</svg>';
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            if (servers.length > 1) {
                showServerList();
            } else {
                window.location.href = server_protocol + servers[0].url;
            }
        });
    }

    function showServerList() {
        var list = Lampa.Storage.get('servers') || [];
        var items = list.map((server, index) => ({
            title: server.name,
            url: server.url,
            index: index
        }));

        Lampa.Select.show({
            title: 'Выберите сервер',
            items: items,
            onSelect: function(item) {
                window.location.href = server_protocol + item.url;
            }
        });
    }

    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: '<svg width="24px" height="24px" fill="currentColor">...</svg>'
    });

    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'add_server',
            type: 'button',
            values: 'Добавить сервер'
        },
        field: {
            name: 'Добавить сервер',
            description: 'Добавить новый сервер с именем и адресом'
        },
        onChange: function() {
            Lampa.Modal.input({
                title: 'Введите имя сервера',
                onBack: () => Lampa.SettingsApi.show('location_redirect'),
                onSelect: function(name) {
                    Lampa.Modal.input({
                        title: 'Введите адрес сервера',
                        onBack: () => Lampa.SettingsApi.show('location_redirect'),
                        onSelect: function(url) {
                            servers.push({ name, url });
                            Lampa.Storage.set('servers', servers);
                            updateIcon();
                        }
                    });
                }
            });
        }
    });

    updateIcon();
})();
