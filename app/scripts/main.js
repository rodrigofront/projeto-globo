$(function(){
	
	//renderizar repositorios do globocom
	var org   	   = 'https://api.github.com/users/globocom',
		// org_repos  = 'https://api.github.com/orgs/globocom/repos?type=public&per_page=200',
		org_repos  = 'https://api.github.com/search/repositories?q=user:globocom&sort=stars&order=desc&per_page=3',
		commits,
		forks_count,
		stargazers_count,

		repositories;

	function sortByStars(data) {
        data.sort(function(a,b) {
        return b.stargazers_count - a.stargazers_count;
       });
    }

	$.getJSON(org_repos, function(json){
		repositories = json.items;
		// console.log(repositories);
		// outputPageContent(repositories);

		let repositorio = new Repositorios();
		console.log(repositories);
		repositorio.lista(repositories);
	});

	class Repositorios {
	    constructor(nome, count_forks, count_stars){
	        this.name = name;
	        this.stargazers_count = stargazers_count;
	        this.forks_count = forks_count;
	    }

	    lista(repositories){
		var lista = $('#github-projects');

		for(var i=0; i < repositories.length; i++){
        	//conteúdo do loop
        	let repositorio = new Repositorios(repositories[i].name, repositories[i].stargazers_count, repositories[i].forks_count)
    		console.log(repositorio[i].name);
    		}
		}
	}

	
	

	function outputPageContent(data) {
		// sortByStars(data);
		
		$(data).each(function() {
	        $('#github-projects').append('<li><a href="'+ this.name +'" class="repos" data-repo-forks="'+ this.forks_count +'" data-repo-name="'+ this.name +'" data-repo-stars="'+ this.stargazers_count +'">' + this.name + '</a></li>');
		});	
	}

	function outputPageContent2(data, stars, forks, repo_name) {
		// $('.stars').empty();
		$('.stars').html(stars);

		// $('.forks').empty();
		$('.forks').html(forks);

		// $('.repo-name').empty();
		$('.repo-name').html(repo_name);

		$('#last-commits').empty();

		$(data).each(function() {
	        $('#last-commits').append('<li><p>'+ this.commit.author.name +'</p><p>'+ this.commit.message +'</p><p>'+ this.commit.author.date +'</p></li>');
		});	
	}



	//no clique do repositorio mostrar commits
	$('#github-projects').on('click', '.repos', function(event){
		event.preventDefault();
		var repo_name = $(this).data('repo-name');
		var repo_stars = $(this).data('repo-stars');
		var repo_forks = $(this).data('repo-forks');
		var commits_repo = 'https://api.github.com/repos/globocom/'+repo_name+'/commits?per_page=20'
			
		$.getJSON(commits_repo, function(json){
			commits = json;   
			console.log(commits);
			outputPageContent2(commits, repo_stars, repo_forks, repo_name);                
		});


		// console.log(repo_name, commits_repo);


	})
});
