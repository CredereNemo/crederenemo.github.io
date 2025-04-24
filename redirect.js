(function() {
    'use strict';

    // Устанавливаем режим для телевизионной платформы
    Lampa.Platform.tv();

    // Определяем протокол сервера (http или https)
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';

    // SVG-иконка переключения сервера (стрелки)
    var icon_server_redirect = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 8l-4 4 4 4v-3h9v-2H7V8zm10-4v3H8v2h9v3l4-4-4-4z"/>
        </svg>`;

    // Создаёт кнопку в верхнем меню, если есть сервера
    function startRedirectButton() {
        $('#REDIRECT').remove(); // Удаляем предыдущую кнопку
        var servers = Lampa.Storage.get('location_servers') || [];
        if (!servers.length) return;

        var buttonHtml = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
        $('.head__actions').append(buttonHtml);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

        $('#REDIRECT').on('hover:enter', function() {
            openServerSelection();
        });
    }

    // Показывает список серверов на выбор
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

        var options = servers.map(server => ({
            title: server,
            callback: () => window.location.href = server_protocol + server
        }));

        Lampa.Select.show({
            title: 'Выберите сервер',
            items: options,
            onSelect: (item) => item.callback()
        });
    }

    // Добавляем пункт настроек для смены сервера
    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: icon_server_redirect
    });

    // Добавляем поле ввода адресов серверов
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
            // Форматируем адреса: обрезаем пробелы и делаем нижний регистр
            var servers = value.split(',')
                .map(s => s.trim().toLowerCase())
                .filter(Boolean);

            // Сохраняем в хранилище
            Lampa.Storage.set('location_servers', servers);

            // Обновляем значение в настройке (чтобы не было заглавных букв в поле)
            this.param.values = servers.join(',');
            this.input.val(this.param.values);  // это обновит текстовое поле визуально

            // Перезапускаем кнопку
            startRedirectButton();
        }

    });

    // Ждём готовности приложения и запускаем добавление кнопки
    if (window.appready) startRedirectButton();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startRedirectButton();
        });
    }
})();
