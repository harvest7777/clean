using clean.Domain.Events;
using Microsoft.Extensions.Logging;

namespace clean.Application.TodoItems.EventHandlers;

public class LogArticleItemPublished : INotificationHandler<ArticleItemPublishedEvent>
{
    private readonly ILogger<LogArticleItemPublished> _logger;

    public LogArticleItemPublished(ILogger<LogArticleItemPublished> logger)
    {
        _logger = logger;
    }

    public Task Handle(ArticleItemPublishedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("clean Domain Event: {DomainEvent}", notification.GetType().Name);

        return Task.CompletedTask;
    }
}
