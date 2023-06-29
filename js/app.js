//Estamos utilizando la base de datos MEALDB y accedemos a ella a traves de su API
function iniciarApp(){
    let listaRecetas = [];
    let paginaActual = 1;
    let resultadosPorPagina = 9;
    const resultado = document.querySelector('#resultado');
    const selectCategorias = document.querySelector('#categorias');
    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }
    //Favoritos ruta
    const favoritosHTML = document.querySelector('.favoritos');
    if(favoritosHTML){
        obtenerFavoritos();
    }
    const modal = new bootstrap.Modal('#modal',{});
    const btnPaginaAnterior = document.querySelector('#btnPaginaAnterior');
    const btnPaginaSiguiente = document.querySelector('#btnPaginaSiguiente');
    if (btnPaginaAnterior && btnPaginaSiguiente) {
        console.log('entre');
        btnPaginaAnterior.addEventListener('click', paginaAnterior);
        btnPaginaSiguiente.addEventListener('click', paginaSiguiente);
    }
    // Función para avanzar a la página siguiente
    function paginaSiguiente() {
        console.log('entre Siguiente');
        paginaActual++;
        mostrarRecetas(listaRecetas);
    }
    // Función para retroceder a la página anterior
    function paginaAnterior() {
        if (paginaActual > 1) {
            console.log('entre Anterior');
            paginaActual--;
            mostrarRecetas(listaRecetas);
        }
    }

    async function obtenerCategorias() {
        try {
            const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
            const response = await fetch(url);
            const data = await response.json();
            mostrarCategorias(data.categories);
        } catch (error) {
            console.error('Error:', error);
        }
    }
    function mostrarCategorias(categorias = []){
        categorias.forEach(categoria => {
            const {strCategory} = categoria;
            const option = document.createElement('option');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategorias.appendChild(option);
        });
    }
    function seleccionarCategoria(e){
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        fetch(url)
            .then(answer => answer.json())
            .then(answer => {
                listaRecetas = answer.meals;
                paginaActual = 1;
                mostrarRecetas(listaRecetas);
                
            });
    }
    function mostrarRecetas(recetas = []){
        limpiarHTML(resultado);
        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultados Cargados' : 'No hay resultados';
        console.log(recetas.length);
        if(recetas.length){
            const indiceInicio = (paginaActual - 1) * resultadosPorPagina;
            const indiceFinal = paginaActual * resultadosPorPagina;
            const recetasPagina = recetas.slice(indiceInicio, indiceFinal);
            resultado.appendChild(heading);
            recetasPagina.forEach(receta => {
                const {idMeal, strMeal, strMealThumb} = receta;
                const recetaContenedor = document.createElement('DIV');
                recetaContenedor.classList.add('col-md-4');

                const recetaCard = document.createElement('DIV');
                recetaCard.classList.add('card', 'mb-4');

                const recetaImagen = document.createElement('IMG');
                recetaImagen.classList.add('card-img-top');
                recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
                recetaImagen.src = strMealThumb ?? receta.img;

                const recetaCardCuerpo = document.createElement('DIV');
                recetaCardCuerpo.classList.add('card-body');
                
                const recetaTitulo = document.createElement('h3');
                recetaTitulo.classList.add('card-title','mb-3');
                recetaTitulo.textContent = strMeal ?? receta.titulo;

                const recetaBoton = document.createElement('BUTTON');
                recetaBoton.classList.add('btn', 'btn-success','w-100');
                recetaBoton.textContent = 'Ver Receta';
                // recetaBoton.dataset.bsTarget = "#modal";
                // recetaBoton.dataset.bsToggle = "modal";
                recetaBoton.onclick = function(){
                    seleccionarReceta(idMeal ?? receta.id);
                }
                //Agregarlo en el codigo HTML 
                recetaCardCuerpo.appendChild(recetaTitulo);
                recetaCardCuerpo.appendChild(recetaBoton);

                recetaCard.appendChild(recetaImagen);
                recetaCard.appendChild(recetaCardCuerpo);

                recetaContenedor.appendChild(recetaCard);

                resultado.appendChild(recetaContenedor);
                // console.log(recetaImagen);
            })
        }
        // Ya que ahora no necseitamos que este obligado a estar al fin de la web, podemos quitar la clase
        const footer = document.querySelector('footer');
        footer.classList.remove('fixed-bottom');
    }
    function seleccionarReceta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(answer => answer.json())
            .then(answer => mostrarRecetaModal(answer.meals[0]));
    }
    function mostrarRecetaModal(receta){
        // Mostrando el modal
        const {idMeal, strInstructions, strMeal, strMealThumb} = receta;
        //Anadiendo contenido al header y cuerpo del modal
        const modalTitulo = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');
        modalTitulo.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y Cantidades</h3>
        `;
        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        // Mostrar cantidades e i1gredientes
        for (let index = 1; index < 20; index++) {
            if(receta[`strIngredient${index}`]){
                const ingrediente = receta[`strIngredient${index}`];
                const cantidad = receta[`strMeasure${index}`];
                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;
                listGroup.appendChild(ingredienteLi);
            }
        }
        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        // Sino elimnamos por cada receta seleccionada se seguiran agregando botones
        limpiarHTML(modalFooter);
        //botones de cerrar y favorito
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn','btn-success','col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';
        btnFavorito.onclick = function(){
            // console.log(existeStorage(idMeal));
            if(existeStorage(idMeal)){
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Eliminado Correctamente');
                return; 
            }
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });
            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Agregado Correctamente');
        }

        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn','btn-secondary','col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function(){
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);
        //Mostrar el modal
        modal.show();
    }
    function agregarFavorito(receta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }
    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }
    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favorito => favorito.id === id);
    }
    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    }
    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if(favoritos.length){
            mostrarRecetas(favoritos);
            return;
        }
        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No hay favoritos aun';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold','mt-5');
        favoritosHTML.appendChild(noFavoritos);
    }
    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }
}
document.addEventListener('DOMContentLoaded', iniciarApp);