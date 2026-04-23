using clean.Domain.Entities;
using clean.Domain.Enums;

namespace clean.Application.Articles.Queries.GetArticles;

public class ArticleDto
{
    public int Id { get; init; }

    public string? Title { get; init; }

    public string? Content { get; init; }

    public ArticleStatus Status { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<ArticleItem, ArticleDto>();
        }
    }
}
