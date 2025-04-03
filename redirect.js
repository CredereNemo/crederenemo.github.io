(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = Lampa.Storage.get('servers_list') || [];
    
    function updateUI() {
        $('#REDIRECT').remove();
        if (servers.length > 0) {
            var domainSVG = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75Z" fill="currentColor"></path></svg>';
            var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + domainSVG + '</div>';
            $('#app > div.head > div > div.head__actions').append(domainBUTT);
            
            $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
                if (servers.length === 1) {
                    window.location.href = server_protocol + servers[0].url;
                } else {
                    showServerMenu();
                }
            });
        }
    }
    
    function showServerMenu() {
        var menu = Lampa.Activity.create({
            title: 'Выбор сервера',
            items: servers.map(server => ({
                title: server.name,
                url: server.url
            })),
            onSelect: function(item) {
                window.location.href = server_protocol + item.url;
            }
        });
        Lampa.Activity.push(menu);
    }
    
    function addServer(name, url) {
        if (name && url) {
            servers.push({ name: name, url: url });
            Lampa.Storage.set('servers_list', servers);
            updateUI();
        }
    }
    
    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: '<svg width="24px" height="24px"></svg>'
    });
    
    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'server_name',
            type: 'input',
            values: '',
            placeholder: 'Название сервера',
            default: ''
        },
        field: {
            name: 'Имя сервера',
            description: 'Введите название для добавляемого сервера'
        }
    });
    
    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'server_url',
            type: 'input',
            values: '',
            placeholder: 'http://example.com',
            default: ''
        },
        field: {
            name: 'Адрес сервера',
            description: 'Введите URL сервера'
        }
    });
    
    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'add_server',
            type: 'button',
            default: false
        },
        field: {
            name: 'Добавить сервер',
            description: 'Добавляет сервер в список'
        },
        onChange: function() {
            var name = Lampa.Storage.get('server_name');
            var url = Lampa.Storage.get('server_url');
            addServer(name, url);
        }
    });
    
    updateUI();
})();
