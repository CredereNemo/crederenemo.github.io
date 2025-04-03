(function () {
    'use strict';

    Lampa.Platform.tv();
    const server_protocol = location.protocol === "https:" ? 'https://' : 'http://';

    const icon_server_redirect = `
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 4h9a1 1 0 0 1 1 1v5h3V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v5h3V5a1 1 0 0 1 1-1zm14 16h-9a1 1 0 0 1-1-1v-5H6v5a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-5h-3v5a1 1 0 0 1-1 1z"/>
        </svg>`;

    function getServers() {
        return Lampa.Storage.get('location_servers') || [];
    }

    function saveServers(servers) {
        Lampa.Storage.set('location_servers', servers);
    }

    function checkServerStatus(url, callback) {
        fetch(url, { method: 'HEAD', mode: 'no-cors' })
            .then(() => callback(true))
            .catch(() => callback(false));
    }

    function updateRedirectButton() {
        $('#REDIRECT').remove();
        const servers = getServers();

        if (servers.length === 0) return;

        const button = `<div id="REDIRECT" class="head__action selector redirect-screen">${icon_server_redirect}</div>`;
        $('div.head__actions').append(button);

        $('#REDIRECT').on('click hover:enter hover:touch', function () {
            if (servers.length === 1) {
                window.location.href = server_protocol + servers[0].url;
            } else {
                showServerMenu();
            }
        });
    }

    function showServerMenu() {
        const servers = getServers();
        const items = servers.map(server => ({
            title: `${server.name} (${server.status ? '🟢' : '🔴'})`,
            subtitle: server.url,
            onSelect: () => window.location.href = server_protocol + server.url
        }));

        Lampa.Select.show({
            title: 'Выбор сервера',
            items: items,
            onBack: () => Lampa.Controller.toggle('head')
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
            type: 'button',
            values: '',
            placeholder: 'Добавить сервер',
            default: ''
        },
        field: {
            name: 'Список серверов',
            description: 'Нажмите, чтобы управлять списком серверов'
        },
        onChange: function () {
            showServerManager();
        }
    });

    function showServerManager() {
        const servers = getServers();

        const items = servers.map((server, index) => ({
            title: `${server.name} (${server.status ? '🟢' : '🔴'})`,
            subtitle: server.url,
            onSelect: () => removeServer(index)
        }));

        items.push({
            title: '➕ Добавить сервер',
            onSelect: () => addServer()
        });

        Lampa.Select.show({
            title: 'Управление серверами',
            items: items,
            onBack: () => Lampa.Controller.toggle('settings')
        });
    }

    function addServer() {
        Lampa.Input.open({
            title: 'Добавить сервер',
            value: '',
            placeholder: 'Введите название сервера',
            onEnter: (name) => {
                Lampa.Input.open({
                    title: 'Введите адрес сервера',
                    value: '',
                    placeholder: 'Например: lampa.surge.sh',
                    onEnter: (url) => {
                        const servers = getServers();
                        checkServerStatus(server_protocol + url, (status) => {
                            servers.push({ name, url, status });
                            saveServers(servers);
                            updateRedirectButton();
                            showServerManager();
                        });
                    }
                });
            }
        });
    }

    function removeServer(index) {
        const servers = getServers();
        servers.splice(index, 1);
        saveServers(servers);
        updateRedirectButton();
        showServerManager();
    }

    if (Lampa.Storage.field('const_redirect')) {
        const servers = getServers();
        if (servers.length > 0) window.location.href = server_protocol + servers[0].url;
    }

    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') updateRedirectButton();
    });

})();
