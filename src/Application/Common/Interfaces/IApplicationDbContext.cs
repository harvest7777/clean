using clean.Domain.Entities;

namespace clean.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<ArticleItem> ArticleItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
