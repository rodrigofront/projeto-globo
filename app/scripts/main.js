$(function(){
    //renderizar repositorios do globocom
    let org        = 'https://api.github.com/users/globocom',
        org_repos  = 'https://api.github.com/search/repositories?q=user:globocom&sort=stars&order=desc&per_page=200',
        hash       = document.URL.substr(document.URL.indexOf('#')+1),
        commits,
        commits_repo = '',
        url_mostra_mais_commits,
        repo_name,
        per_page_commits = 20,
        forks_count,
        stargazers_count,
        numberPage = 1,
        repositories;


    function parse_link_header(header) {
        if (header.length === 0) {
            throw new Error("input must not be of zero length");
        }

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

    // class Author {
    //     constructor(nome, url_photo){
    //         this.nome = nome;
    //         this.url_photo = url_photo;
    //     }
    // }

    class RenderizadorHtml {
        renderizarRepositorios(jsonDeRepositorios){
            for(var i=0; i < jsonDeRepositorios.length; i++){
                //conteúdo do loop
                let repositorio = new Repositorio(jsonDeRepositorios[i].name, jsonDeRepositorios[i].stargazers_count, jsonDeRepositorios[i].forks)
                $('#github-projects').append('<li><a href="'+ repositorio.nome +'" class="repos" data-repo-forks="'+ repositorio.forks +'" data-repo-name="'+ repositorio.nome +'" data-repo-stars="'+ repositorio.stars +'">' + repositorio.nome + '</a></li>');
            }
        }

        renderizarCommits(jsonDeCommits, stars, forks, repo_name, url_mostra_mais_commits){
        	if (url_mostra_mais_commits) {
		        $('.stars').html(stars);

		        $('.forks').html(forks);

		        $('.repo-name').html(repo_name);

		        $('#last-commits').empty();

		        for(var i=0; i < jsonDeCommits.length; i++){
	        	    let commit = new Commit(jsonDeCommits[i].commit.author.name, jsonDeCommits[i].commit.message, jsonDeCommits[i].commit.author.date)
	        	    $('#last-commits').append('<li><p>'+ commit.author +'</p><p>'+ commit.descricao +'</p><p>'+ commit.data +'</p></li>');
	        	}
		        
	        	$('#box-btn').empty();
            	$('#box-btn').append('<a href="#" class="btn-show-more">Ver mais</a>');
		        

		        else {
	        		$('.btn-show-more').hide();
		        }
        	}

	        else {
	        	for(var i=0; i < jsonDeCommits.length; i++){
    		        let commit = new Commit(jsonDeCommits[i].commit.author.name, jsonDeCommits[i].commit.message, jsonDeCommits[i].commit.author.date)
    		        $('#last-commits').append('<li><p>'+ commit.author +'</p><p>'+ commit.descricao +'</p><p>'+ commit.data +'</p></li>');
    		    }

	        	if (jsonDeCommits.length != url_mostra_mais_commits) {
    				$('.btn-show-more').hide();
	        	}
	        }
        }
    }

    $.ajax({
        url: org_repos,
        type: 'get',
        success: function(json){
            let renderer = new RenderizadorHtml();
        	renderer.renderizarRepositorios(json.items);

        	if(window.location.hash) {
        	    repo_name = hash;
        	    commits_repo = 'https://api.github.com/repos/globocom/'+hash+'/commits?per_page='+per_page_commits+'&page='+numberPage+'';

        	    $.ajax({
        	        url: commits_repo,
        	        type: 'get',
        	        success: function(json, status, xhr){
        	            let renderer = new RenderizadorHtml();
        	            renderer.renderizarCommits(json, 5, 2, hash);
        	            // console.log(xhr.getResponseHeader('Link'));

        	            
        	        },
        	        error: function(erro){
        	          console.log('deu erro', erro);
        	        }
        	    });
        	};
        },

        error: function(erro){
          console.log('deu erro', erro);
        }
    });

    //no clique do repositorio mostrar commits
    $('#github-projects').on('click', '.repos', function(event){
    	numberPage = 1;
        event.preventDefault();
        	repo_name = $(this).data('repo-name');
        var repo_stars = $(this).data('repo-stars');
        var repo_forks = $(this).data('repo-forks');
        	commits_repo = 'https://api.github.com/repos/globocom/'+repo_name+'/commits?per_page='+per_page_commits+'&page='+numberPage+'';

		window.location.hash = repo_name;

		$.ajax({
		    url: commits_repo,
		    type: 'get',
		    success: function(json, status, xhr){
		        let renderer = new RenderizadorHtml();
            	
            	if (xhr.getResponseHeader('Link') == null) {
            		renderer.renderizarCommits(json, repo_stars, repo_forks, repo_name, xhr.getResponseHeader('Link'));	
            	}

            	else {
        			renderer.renderizarCommits(json, repo_stars, repo_forks, repo_name, parse_link_header(xhr.getResponseHeader('Link')).next);
            	}
		    },
		    error: function(erro){
		      console.log('deu erro', erro);
		    }
		});
    });

    $('#box-btn').on('click', '.btn-show-more', function(event){
    	numberPage++;
    	commits_repo = url_mostra_mais_commits;
    	event.preventDefault();

		$.ajax({
		    url: commits_repo,
		    type: 'get',
		    success: function(json){
		        let renderer = new RenderizadorHtml();
        		renderer.renderizarCommits(json, null, null, null);
		    },
		    error: function(erro){
		      console.log('deu erro', erro);
		    }
		});
	});
});
