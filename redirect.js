(function () {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25ZM10 3.75H14V2.25H10V3.75ZM2.75 13V12H1.25V13H2.75ZM13 20.25H10V21.75H13V20.25ZM21.25 11V12H22.75V11H21.25ZM1.25 13C1.25 14.8644 1.24841 16.3382 1.40313 17.489C1.56076 18.6614 1.89288 19.6104 2.64124 20.3588L3.7019 19.2981C3.27869 18.8749 3.02502 18.2952 2.88976 17.2892C2.75159 16.2615 2.75 14.9068 2.75 13H1.25ZM10 20.25C8.09318 20.25 6.73851 20.2484 5.71085 20.1102C4.70476 19.975 4.12511 19.7213 3.7019 19.2981L2.64124 20.3588C3.38961 21.1071 4.33855 21.4392 5.51098 21.5969C6.66182 21.7516 8.13558 21.75 10 21.75V20.25Z" /></svg>';

    function getServers() {
        return JSON.parse(Lampa.Storage.get('servers') || '[]');
    }

    function saveServers(servers) {
        Lampa.Storage.set('servers', JSON.stringify(servers));
    }

    function checkServerStatus(url, callback) {
        fetch(url, { method: 'HEAD', mode: 'no-cors' })
            .then(() => callback(true))
            .catch(() => callback(false));
    }

    function selectServer() {
        let servers = getServers();

        if (servers.length === 1) {
            window.location.href = server_protocol + servers[0].url;
            return;
        }

        let items = servers.map(server => ({
            title: server.name + (server.status ? ' ✅' : ' ❌'),
            url: server.url
        }));

        Lampa.Select.show({
            title: 'Выберите сервер',
            items: items,
            onSelect: (item) => {
                window.location.href = server_protocol + item.url;
            }
        });
    }

    function addServer() {
        Lampa.Utils.pincode({
            title: 'Введите название сервера',
            nofocus: true,
            onSelect: (name) => {
                if (!name) return;

                Lampa.Utils.pincode({
                    title: 'Введите адрес сервера',
                    nofocus: true,
                    onSelect: (url) => {
                        if (!url) return;

                        let servers = getServers();
                        checkServerStatus(server_protocol + url, (status) => {
                            servers.push({ name, url, status });
                            saveServers(servers);
                            updateRedirectButton();
                        });
                    }
                });
            }
        });
    }

    function updateRedirectButton() {
        $('#REDIRECT').remove();
        let domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

        $('#REDIRECT').on('hover:enter hover:click hover:touch', function () {
            selectServer();
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
            values: 'Добавить сервер'
        },
        field: {
            name: 'Добавить сервер',
            description: 'Добавьте новый сервер в список'
        },
        onChange: addServer
    });

    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'const_redirect',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Постоянный редирект',
            description: 'Внимание! Если включено, при старте приложения сразу будет загружаться выбранный сервер'
        }
    });

    if (Lampa.Storage.field('const_redirect')) {
        let servers = getServers();
        if (servers.length > 0) {
            window.location.href = server_protocol + servers[0].url;
        }
    }

    if (window.appready) updateRedirectButton();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') updateRedirectButton();
        });
    }
})();
