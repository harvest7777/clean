using clean.Application.Common.Interfaces;
using clean.Domain.Entities;

namespace clean.Application.Articles.Commands.CreateArticleItem;

public record CreateArticleItemCommand : IRequest<int>
{
    public string? Title { get; init; }

    public string? Content { get; init; }
}

public class CreateArticleItemCommandHandler : IRequestHandler<CreateArticleItemCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateArticleItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateArticleItemCommand request, CancellationToken cancellationToken)
    {
        var entity = new ArticleItem
        {
            Title = request.Title,
            Content = request.Content,
        };

        _context.ArticleItems.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
