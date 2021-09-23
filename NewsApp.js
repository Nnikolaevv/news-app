// Custom Http module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                })
                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                })
                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                })
                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                })
                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });

                    xhr.send(JSON.stringify(body));
                }

            } catch (error) {
                cb(error)
            }
        }
    }
}


// Init http module
const http = customHttp();
const newsService = (function () {
    const apiKey = 'cf202ce6862844ba99a982e41c5c3919';
    const apiUrl = 'https://newsapi.org/v2';

    return {
        topHeadlines(country = 'ru', category, cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);

        },

        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb)

        },
    }
})();

// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const categorySelect = form.elements['category']

form.addEventListener('submit', e => {
    e.preventDefault();
    loadNews()
})


// Load news function
function loadNews() {
    showLoader();
    const country = countrySelect.value;
    const searchText = searchInput.value;
    const category = categorySelect.value;

    if (!searchText) {
        newsService.topHeadlines(country, category, onGetResponse);
    } else {
        newsService.everything(searchText, onGetResponse)
    }

}

// Function on get response from server
function onGetResponse(err, res) {
    removeLoader();

    if (err) {
        showAlert(err, 'error-msg');
        return
    }

    if (!res.articles.length) {
        showEmptyMsg('News at this parameters NOT FOUND', 'error-msg');
        return
    }
    renderNews(res.articles)
}

// Function render news
function renderNews(news) {
    const container = document.querySelector('.grid-container');
    if (container.children.length) {
        clearContainer(container);
    }
    let fragment = '';
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    })
    container.insertAdjacentHTML('afterbegin', fragment)
}


// News item template function
function newsTemplate({urlToImage, title, description, url}) {
    return `
        <div class="col s12">
             <div class="card">
                  <div class="card-image">
                    <img src="${urlToImage}" onerror="this.src='http://pikstok.ru/images/images/1528372927887.jpg'" alt="">
                    <span class="card-title">${title || ''}</span>
                  </div>
            <div class="card-content">
                <p>${description || ''}</p>
             </div>
             <div class="card-action">
                 <a href="${url}">Read more</a>
            </div>
            </div>
        </div>
        `
}


// init selects
document.addEventListener('DOMContentLoaded', function () {
    M.AutoInit();
    loadNews();
})

// Function show alert
function showAlert(msg, type = 'success') {
    M.toast({html: msg, classes: type});
}

// Function show empty
function showEmptyMsg(msg, type = 'succes') {
    const container = document.querySelector('.grid-container');
    clearContainer(container);
    M.toast({html: msg, classes: type});
}

// Function clear container
function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

// Show loader function
function showLoader() {
    document.body.insertAdjacentHTML('afterbegin',
        `
            <div class="progress">
                <div class="indeterminate"></div>
            </div>
            `)
}

// Remove loader
function removeLoader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove()
    }
}

