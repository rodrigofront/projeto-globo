$(function(){
	var hash = document.URL.substr(document.URL.indexOf('#')+1)
	
	// if ( hash != '' ) {
	// 	console.log(hash);	
	// }

	// else {
	// 	console.log('toma ai');
	// }

	if(window.location.hash) {
	  // Fragment exists
	  console.log('tem hash');
	} else {
	  console.log('nao tem hash');
	}
	
    //renderizar repositorios do globocom
    let org        = 'https://api.github.com/users/globocom',
        org_repos  = 'https://api.github.com/search/repositories?q=user:globocom&sort=stars&order=desc&per_page=200',
        commits,
        commits_repo = '',
        repo_name,
        per_page_commits = 20,
        first_request = true,
        forks_count,
        stargazers_count,
        numberPage = 1,
        repositories;

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

        renderizarCommits(jsonDeCommits, stars, forks, repo_name, first_request){
        	if (first_request) {
		        $('.stars').html(stars);

		        $('.forks').html(forks);

		        $('.repo-name').html(repo_name);

		        $('#last-commits').empty();

		        for(var i=0; i < jsonDeCommits.length; i++){
	        	    let commit = new Commit(jsonDeCommits[i].commit.author.name, jsonDeCommits[i].commit.message, jsonDeCommits[i].commit.author.date)
	        	    $('#last-commits').append('<li><p>'+ commit.author +'</p><p>'+ commit.descricao +'</p><p>'+ commit.data +'</p></li>');
	        	}

		        if (jsonDeCommits.length == per_page_commits) {
		        	$('#box-btn').empty();
	            	$('#box-btn').append('<a href="#" class="btn-show-more">Ver mais</a>');
		        }

		        else {
	        		$('.btn-show-more').hide();
		        }
        	}
	        
	        else {
	        	for(var i=0; i < jsonDeCommits.length; i++){
    		        let commit = new Commit(jsonDeCommits[i].commit.author.name, jsonDeCommits[i].commit.message, jsonDeCommits[i].commit.author.date)
    		        $('#last-commits').append('<li><p>'+ commit.author +'</p><p>'+ commit.descricao +'</p><p>'+ commit.data +'</p></li>');
    		    }

	        	if (jsonDeCommits.length != per_page_commits) {
    				$('.btn-show-more').hide();			
	        	}
	        }
        }
    }

    $.getJSON(org_repos, function(json){
        let renderer = new RenderizadorHtml();
        renderer.renderizarRepositorios(json.items);
    });

    //no clique do repositorio mostrar commits
    $('#github-projects').on('click', '.repos', function(event){
    	first_request = true;
    	numberPage = 1;
        event.preventDefault();
        	repo_name = $(this).data('repo-name');
        var repo_stars = $(this).data('repo-stars');
        var repo_forks = $(this).data('repo-forks');
        	commits_repo = 'https://api.github.com/repos/globocom/'+repo_name+'/commits?per_page='+per_page_commits+'&page='+numberPage+'';

		window.location.hash = repo_name;

        $.getJSON(commits_repo, function(json){
    		let renderer = new RenderizadorHtml();
        	renderer.renderizarCommits(json, repo_stars, repo_forks, repo_name, first_request);
        });
    });

    $('#box-btn').on('click', '.btn-show-more', function(event){
    	first_request = false;
    	numberPage++;
    	commits_repo = 'https://api.github.com/repos/globocom/'+repo_name+'/commits?per_page='+per_page_commits+'&page='+numberPage+'';
    	event.preventDefault();
		
		$.getJSON(commits_repo, function(json){
    		let renderer = new RenderizadorHtml();
        	renderer.renderizarCommits(json, null, null, null, first_request);
        });
	});
});
