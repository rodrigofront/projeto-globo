$(function(){

    //renderizar repositorios do globocom
    let org        = 'https://api.github.com/users/globocom',
        org_repos  = 'https://api.github.com/search/repositories?q=user:globocom&sort=stars&order=desc&per_page=200',
        commits,
        forks_count,
        stargazers_count,
        repositories;

    class Repositorio {
        constructor(nome, count_stars, count_forks){
            this.nome = nome;
            this.stars = count_forks;
            this.forks = count_stars;
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

    class Author {
        constructor(nome, url_photo){
            this.nome = nome;
            this.url_photo = url_photo;
        }
    }

    class RenderizadorHtml {
        renderizarRepositorios(jsonDeRepositorios){
            for(var i=0; i < jsonDeRepositorios.length; i++){
                //conteúdo do loop
                let repositorio = new Repositorio(jsonDeRepositorios[i].name, jsonDeRepositorios[i].stargazers_count, jsonDeRepositorios[i].forks)
                $('#github-projects').append('<li><a href="'+ repositorio.nome +'" class="repos" data-repo-forks="'+ repositorio.forks +'" data-repo-name="'+ repositorio.nome +'" data-repo-stars="'+ repositorio.stars +'">' + repositorio.nome + '</a></li>');
            }
        }
    }

    $.getJSON(org_repos, function(json){
        let renderer = new RenderizadorHtml();

        renderer.renderizarRepositorios(json.items);
    });


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
