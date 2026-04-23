using clean.Application.Common.Interfaces;

namespace clean.Application.Articles.Commands.DeleteArticleItem;

public record DeleteArticleItemCommand(int Id) : IRequest;

public class DeleteArticleItemCommandHandler : IRequestHandler<DeleteArticleItemCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteArticleItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteArticleItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ArticleItems
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        _context.ArticleItems.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
