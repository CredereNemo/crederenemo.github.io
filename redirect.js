(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = Lampa.Storage.get('server_list') || [];

    function renderIcon() {
        $('#REDIRECT').remove();
        if (servers.length > 0) {
            var domainSVG = '<svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25Z" fill="currentColor"></path></svg>';
            var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + domainSVG + '</div>';
            $('#app > div.head > div > div.head__actions').append(domainBUTT);
            $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
            $('#REDIRECT').on('hover:enter', function() {
                if (servers.length === 1) {
                    window.location.href = server_protocol + servers[0].address;
                } else {
                    showServerMenu();
                }
            });
        }
    }

    function showServerMenu() {
        var list = [];
        servers.forEach(function(server, index) {
            list.push({
                title: server.name,
                subtitle: server.address,
                onEnter: function() {
                    window.location.href = server_protocol + server.address;
                }
            });
        });
        Lampa.Select.show({
            title: 'Выбор сервера',
            items: list,
            onBack: function() {
                Lampa.Controller.toggle('content');
            }
        });
    }

    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Управление серверами',
        icon: ''
    });

    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'server_list',
            type: 'button',
            values: '',
            default: ''
        },
        field: {
            name: 'Добавить сервер',
            description: 'Управление списком серверов'
        },
        onChange: function() {
            Lampa.Input.show({
                title: 'Добавить сервер',
                placeholder: 'Введите имя сервера',
                onEnter: function(name) {
                    Lampa.Input.show({
                        title: 'Введите адрес сервера',
                        placeholder: 'Например: lampa.surge.sh',
                        onEnter: function(address) {
                            servers.push({ name: name, address: address });
                            Lampa.Storage.set('server_list', servers);
                            renderIcon();
                        }
                    });
                }
            });
        }
    });

    if (Lampa.Storage.field('const_redirect') == true && servers.length > 0) {
        window.location.href = server_protocol + servers[0].address;
    }

    if (window.appready) renderIcon();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                renderIcon();
            }
        });
    }

})();
