document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/ciudades')
        .then(response => response.json())
        .then(ciudades => {
            const inputOrigen = document.getElementById('buscar-desde');
            const inputDestino = document.getElementById('buscar-hasta');
            const dropdownOrigen = document.getElementById('ciudadesOrigen');
            const dropdownDestino = document.getElementById('ciudadesDestino');
            const botonBuscar = document.querySelector('.boton-busqueda');

            function populateDropdown(input, dropdown, options, nextFocus = null) {
                let currentFocus = -1;

                function showDropdown() {
                    dropdown.innerHTML = '';
                    options.forEach(option => {
                        const li = document.createElement('li');
                        li.textContent = option;
                        li.classList.add('dropdown-item');
                        li.addEventListener('click', () => {
                            input.value = option;
                            dropdown.style.display = 'none';
                            if (nextFocus) {
                                nextFocus.focus(); 
                            }
                        });
                        dropdown.appendChild(li);
                    });
                    dropdown.style.display = 'block';
                }

                input.addEventListener('focus', () => {
                    currentFocus = -1;
                    showDropdown(); 
                });

                input.addEventListener('input', () => {
                    const filter = input.value.toLowerCase();
                    dropdown.innerHTML = '';
                    currentFocus = -1;

                    const filteredOptions = options.filter(option =>
                        option.toLowerCase().includes(filter)
                    );

                    filteredOptions.forEach(option => {
                        const li = document.createElement('li');
                        li.textContent = option;
                        li.classList.add('dropdown-item');
                        li.addEventListener('click', () => {
                            input.value = option;
                            dropdown.style.display = 'none';
                            if (nextFocus) {
                                nextFocus.focus();
                            }
                        });
                        dropdown.appendChild(li);
                    });

                    dropdown.style.display = filteredOptions.length > 0 ? 'block' : 'none';
                });

                input.addEventListener('keydown', (event) => {
                    const items = dropdown.querySelectorAll('.dropdown-item');
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        if (currentFocus < items.length - 1) {
                            currentFocus++;
                            addActive(items, currentFocus);
                            scrollIntoView(items[currentFocus], dropdown);
                        }
                    } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        if (currentFocus > 0) {
                            currentFocus--;
                            addActive(items, currentFocus);
                            scrollIntoView(items[currentFocus], dropdown);
                        }
                    } else if (event.key === 'Enter') {
                        event.preventDefault();
                        if (currentFocus > -1) {
                            items[currentFocus].click();
                        } else if (nextFocus) {
                            nextFocus.focus();
                            if (nextFocus === inputDestino) {
                                showDropdown(); 
                            }
                        }
                    }
                });

                input.addEventListener('click', () => {
                    showDropdown(); 
                });

                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target) && e.target !== input) {
                        dropdown.style.display = 'none';
                    }
                });

                function addActive(items, index) {
                    removeActive(items);
                    if (items[index]) {
                        items[index].classList.add('active-item');
                        input.value = items[index].textContent;
                    }
                }

                function removeActive(items) {
                    items.forEach(item => item.classList.remove('active-item'));
                }

                function scrollIntoView(item, container) {
                    const containerRect = container.getBoundingClientRect();
                    const itemRect = item.getBoundingClientRect();

                    if (itemRect.top < containerRect.top) {
                        container.scrollTop -= containerRect.top - itemRect.top;
                    } else if (itemRect.bottom > containerRect.bottom) {
                        container.scrollTop += itemRect.bottom - containerRect.bottom;
                    }
                }
            }

            populateDropdown(inputOrigen, dropdownOrigen, ciudades, inputDestino);
            populateDropdown(inputDestino, dropdownDestino, ciudades, botonBuscar);

            inputOrigen.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    inputDestino.focus();
                    dropdownDestino.innerHTML = '';
                    ciudades.forEach(option => {
                        const li = document.createElement('li');
                        li.textContent = option;
                        li.classList.add('dropdown-item');
                        li.addEventListener('click', () => {
                            inputDestino.value = option;
                            dropdownDestino.style.display = 'none';
                            botonBuscar.focus(); 
                        });
                        dropdownDestino.appendChild(li);
                    });
                    dropdownDestino.style.display = 'block';
                }
            });
        })
        .catch(error => console.error('Error al cargar las ciudades:', error));
});
function scrollIntoView(item, container) {
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    if (itemRect.top < containerRect.top) {
        container.scrollTop -= (containerRect.top - itemRect.top) + 5; 
    } else if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += (itemRect.bottom - containerRect.bottom) + 5; 
    }
}

