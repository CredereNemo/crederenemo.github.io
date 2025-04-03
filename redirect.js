function addServer() {
    Lampa.Input.edit({
        value: '',
        placeholder: 'Введите адрес сервера',
        onSave: (value) => {
            if (value.trim() !== '') {
                let servers = Lampa.Storage.get('custom_servers', '[]');
                servers = JSON.parse(servers);
                servers.push(value.trim());
                Lampa.Storage.set('custom_servers', JSON.stringify(servers));
                Lampa.Noty.show('Сервер добавлен!');
            } else {
                Lampa.Noty.show('Ошибка: пустое значение!');
            }
        },
        onCancel: () => {
            Lampa.Noty.show('Добавление отменено.');
        }
    });
}

function showServerMenu() {
    let servers = Lampa.Storage.get('custom_servers', '[]');
    servers = JSON.parse(servers);

    let list = servers.map((server, index) => ({
        title: server,
        onSelect: () => {
            Lampa.Noty.show('Выбран сервер: ' + server);
        },
        onDelete: () => {
            servers.splice(index, 1);
            Lampa.Storage.set('custom_servers', JSON.stringify(servers));
            Lampa.Noty.show('Сервер удалён!');
            showServerMenu();
        }
    }));

    if (list.length === 0) {
        list.push({ title: 'Список пуст', disabled: true });
    }

    Lampa.Select.show({
        title: 'Список серверов',
        items: list,
        onSelect: (item) => item.onSelect && item.onSelect(),
        onBack: () => {
            Lampa.Controller.toggle('content');
        }
    });
}

// Добавляем кнопку в меню
Lampa.Settings.addParam({
    title: 'Управление серверами',
    onSelect: showServerMenu,
    onBack: () => {
        Lampa.Controller.toggle('content');
    }
});
