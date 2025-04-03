(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25ZM10 3.75H14V2.25H10V3.75Z" fill="currentColor"></path> </g></svg>';

    function loadServers() {
        return Lampa.Storage.get('server_list', []);
    }

    function saveServers(servers) {
        Lampa.Storage.set('server_list', servers);
    }

    function startMe() {
        $('#REDIRECT').remove();

        var servers = loadServers();
        if (servers.length === 0) return;

        var domainSVG = icon_server_redirect;
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + domainSVG + '</div>';

        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            if (servers.length === 1) {
                window.location.href = server_protocol + servers[0].url;
            } else {
                showServerList();
            }
        });
    }

    function showServerList() {
        var servers = loadServers();
        var list = [];

        servers.forEach(function(server, index) {
            list.push({
                title: server.name + ' (' + server.url + ')',
                onEnter: function() {
                    window.location.href = server_protocol + server.url;
                }
            });
        });

        Lampa.Select.show({
            title: 'Выбор сервера',
            items: list,
            onBack: function() {
                Lampa.Controller.toggle('settings_component');
            }
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
            name: 'add_server',
            type: 'button',
            values: '',
            default: ''
        },
        field: {
            name: 'Добавить сервер',
            description: 'Введите название и адрес сервера'
        },
        onChange: function() {
            Lampa.Input.show({
                title: 'Добавить сервер',
                value: '',
                placeholder: 'Введите имя',
                onEnter: function(name) {
                    Lampa.Input.show({
                        title: 'Введите адрес',
                        value: '',
                        placeholder: 'Например: lampa.surge.sh',
                        onEnter: function(url) {
                            var servers = loadServers();
                            servers.push({ name: name, url: url });
                            saveServers(servers);
                            startMe();
                        }
                    });
                }
            });
        }
    });

    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') startMe();
        });
    }
})();
