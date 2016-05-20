$(function(){
    let url_org_repos  = 'https://api.github.com/search/repositories?q=user:globocom&sort=stars&order=desc&per_page=100',
        hash       = document.URL.substr(document.URL.indexOf('#')+1),
        map_repositorios = {
        	data: []	
        },
        commits,
        getPagination,
        urlPagination,
        commits_repo = '',
        repo_name,
        per_page_commits = 20,
        forks_count,
        stargazers_count,
        repositories;

    // CHAMADA PARA EXIBIÇÃO DE TODOS OS REPOSITÓRIOS DA GLOBO.COM NO GITHUB
	function getMyRepos () {
		$.ajax({
		    url: url_org_repos,
		    type: 'get',
		    success: function(json, status, xhr){
	    		map_repositorios.data = map_repositorios.data.concat(json.items);

		    	// verifica se a resposta do request contem o Header "Link"
		    	if (xhr.getResponseHeader('Link') != null) {
		    		// verifica se o Header "Link" possui o rel "Next"
		    		if (parse_link_header(xhr.getResponseHeader('Link')).next != null) {
    					url_org_repos = parse_link_header(xhr.getResponseHeader('Link')).next;
	    				getMyRepos();
	    				return;
		    		}
		    	} 

		    	showMyRepos(map_repositorios.data);
		    	formataJsonRepositorios(map_repositorios.data);

	    	    if(window.location.hash) {
	    	        repo_name = hash;
	    	    	commits_repo = 'https://api.github.com/repos/globocom/'+repo_name+'/commits?per_page='+per_page_commits+'';
	    	    	getPagination = false;

	    			searchRepos(repo_name);
	    	    };
		    },

		    error: function(erro){
				console.log('Erro encontrado:', erro.responseText);
		    }
		});	
	}

	function formataJsonRepositorios(data) {
		for (var key in data) {
		  data[key] = {name: data[key].name, stars: data[key].stargazers_count, forks: data[key].forks_count};
		}
		map_repositorios = data;
	}

	function showMyRepos(data) {
	 	let renderer = new RenderizadorHtml();
		renderer.renderizarRepositorios(data);
	}

	function searchRepos(repositorio) {
		for (var i = 0, len = map_repositorios.length; i < len; i++) {
		    if (map_repositorios[i].name === repositorio) {
		        // match is in array[i]
		        getMyCommits(map_repositorios[i].name, map_repositorios[i].stars, map_repositorios[i].forks);
		        break;
		    }
		}
	}

	function getMyCommits(repo_name, stars, forks){
		if (getPagination === false) {
			commits_repo = commits_repo;	
		}
		else {
			commits_repo = urlPagination;
		}
		
		$.ajax({
		    url: commits_repo,
		    type: 'get',
		    success: function(json, status, xhr){
		    	// verifica se a resposta do request contem o Header "Link"
		    	if (xhr.getResponseHeader('Link') != null) {
		    		// verifica se o Header "Link" possui o rel "Next"
		    		if (parse_link_header(xhr.getResponseHeader('Link')).next != null) {
    					urlPagination = parse_link_header(xhr.getResponseHeader('Link')).next;
						showMyCommits(json, repo_name, stars, forks, urlPagination);
		    		}

		    		else {
			    		urlPagination = false;
				        showMyCommits(json, repo_name, stars, forks, urlPagination);	
		    		}
		    	} 

		    },
		    error: function(erro){
		      console.log('Erro encontrado:', erro.responseText);
		    }
		});
	}

	function showMyCommits(jsonDeCommits, name, stars, forks, urlPagination) {
		let renderer = new RenderizadorHtml();
		renderer.renderizarCommits(jsonDeCommits, name, stars, forks, urlPagination);
	}

    class RenderizadorHtml {
        renderizarRepositorios(jsonDeRepositorios){
            for(var i=0; i < jsonDeRepositorios.length; i++){
                //conteúdo do loop
                let repositorio = new Repositorio(jsonDeRepositorios[i].name, jsonDeRepositorios[i].stargazers_count, jsonDeRepositorios[i].forks)
                $('#github-projects').append('<li><a href="#" class="repos" data-repo-forks="'+ repositorio.forks +'" data-repo-name="'+ repositorio.nome +'" data-repo-stars="'+ repositorio.stars +'">' + repositorio.nome + '</a></li>');
            }
        }

        renderizarCommits(jsonDeCommits, name, stars, forks, urlPagination){
	        if (getPagination === false) {
		        $('.repo-name').html(name);

		        $('.stars').html('Estrela(s):'+stars);

		        $('.forks').html('Fork(s):'+forks);
	        
	        	$('#last-commits').empty();	
	        }
	        

	        for(var i=0; i < jsonDeCommits.length; i++){
        	    let commit = new Commit(jsonDeCommits[i].commit.author.name, jsonDeCommits[i].commit.message, jsonDeCommits[i].commit.author.date)
        	    $('#last-commits').append('<li><p>'+ commit.author +'</p><p>'+ commit.descricao +'</p><p>'+ commit.data +'</p></li>');
        	}

	        if (urlPagination) {
	        	$('#box-btn').empty();
            	$('#box-btn').append('<a href="#" data-url="'+urlPagination+'" class="btn-show-more">Ver mais</a>');	
	        }
	        
	        else {
	        	$('.btn-show-more').hide();
	        }	
        }
    }

    getMyRepos();
    

    function parse_link_header(header) {
        // Split parts by comma
        var parts = header.split(',');
        var links = {};
        // Parse each part into a named link
        for(var i=0; i<parts.length; i++) {
            var section = parts[i].split(';');
            if (section.length !== 2) {
                throw new Error("section could not be split on ';'");
            }
            var url = section[0].replace(/<(.*)>/, '$1').trim();
            var name = section[1].replace(/rel="(.*)"/, '$1').trim();
            links[name] = url;
        }
        return links;
    }


    class Repositorio {
        constructor(nome, count_stars, count_forks){
            this.nome = nome;
            this.stars = count_stars;
            this.forks = count_forks;
            this.lista_commits = [];
        }
    }

    class Commit {
        constructor(author, data, descricao){
            this.author = author;
            this.data = data;
            this.descricao = descricao;
        }
    }

    //no clique do repositorio mostrar commits
    $('#github-projects').on('click', '.repos', function(event){
        event.preventDefault();
    	repo_name = $(this).data('repo-name');
    	commits_repo = 'https://api.github.com/repos/globocom/'+repo_name+'/commits?per_page='+per_page_commits+'';
    	getPagination = false;

		window.location.hash = repo_name;

		searchRepos(repo_name);
    });

    $('#box-btn').on('click', '.btn-show-more', function(event){
    	event.preventDefault();
    	getPagination = true;

    	searchRepos(repo_name);
		
	});
});
