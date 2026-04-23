using clean.Application.Articles.Commands.CreateArticleItem;
using clean.Application.Articles.Commands.DeleteArticleItem;
using clean.Application.Articles.Commands.UpdateArticleItem;
using clean.Application.Articles.Commands.UpdateArticleItemDetail;
using clean.Application.Articles.Queries.GetArticleById;
using clean.Application.Articles.Queries.GetArticles;
using Microsoft.AspNetCore.Http.HttpResults;

namespace clean.Web.Endpoints;

public class ArticleItems : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();

        groupBuilder.MapGet(GetArticles);
        groupBuilder.MapGet(GetArticleById, "{id}");
        groupBuilder.MapPost(CreateArticleItem);
        groupBuilder.MapPut(UpdateArticleItem, "{id}");
        groupBuilder.MapPatch(UpdateArticleItemDetail, "UpdateDetail/{id}");
        groupBuilder.MapDelete(DeleteArticleItem, "{id}");
    }

    [EndpointSummary("Get all Articles")]
    [EndpointDescription("Retrieves all articles.")]
    public static async Task<Ok<List<ArticleDto>>> GetArticles(ISender sender)
    {
        var articles = await sender.Send(new GetArticlesQuery());

        return TypedResults.Ok(articles);
    }

    [EndpointSummary("Get an Article by ID")]
    [EndpointDescription("Retrieves a single article by its ID.")]
    public static async Task<Results<Ok<ArticleDto>, NotFound>> GetArticleById(ISender sender, int id)
    {
        var article = await sender.Send(new GetArticleByIdQuery(id));

        return TypedResults.Ok(article);
    }

    [EndpointSummary("Create a new Article")]
    [EndpointDescription("Creates a new article and returns the ID of the created article.")]
    public static async Task<Created<int>> CreateArticleItem(ISender sender, CreateArticleItemCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(ArticleItems)}/{id}", id);
    }

    [EndpointSummary("Update an Article")]
    [EndpointDescription("Updates the specified article. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateArticleItem(ISender sender, int id, UpdateArticleItemCommand command)
    {
        if (id != command.Id)
            return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Update Article Details")]
    [EndpointDescription("Partially updates the specified article. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateArticleItemDetail(ISender sender, int id, UpdateArticleItemDetailCommand command)
    {
        if (id != command.Id)
            return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Delete an Article")]
    [EndpointDescription("Deletes the article with the specified ID.")]
    public static async Task<NoContent> DeleteArticleItem(ISender sender, int id)
    {
        await sender.Send(new DeleteArticleItemCommand(id));

        return TypedResults.NoContent();
    }
}
